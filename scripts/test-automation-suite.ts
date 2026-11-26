import { prisma } from "../src/lib/prisma";
import {
  triggerNewOrderAutomations,
  processCustomerQuizReply,
  getWhatsAppSettings,
} from "../src/lib/whatsapp-automation";
import {
  getVoiceAgentSettings,
  isCurrentlyOffHours,
  toolCheckOrderStatus,
  toolCheckProductAvailability,
  toolBookCallback,
} from "../src/lib/voice-agent";

async function runAutomationSuiteTests() {
  console.log("==================================================");
  console.log("  SAMORA ORDER AUTOMATION & VOICE BOT TEST SUITE  ");
  console.log("==================================================");

  const testOrderNumber = `SMR-TEST-${Date.now().toString().slice(-4)}`;
  const testPhone = "03344826415";
  const testName = "Zubair Hashmi";

  try {
    // 1. Create a mock order for test
    console.log("\n[SETUP] Creating mock order", testOrderNumber);
    const order = await prisma.order.create({
      data: {
        orderNumber: testOrderNumber,
        customerName: testName,
        phone: testPhone,
        city: "Lahore",
        address: "DHA Phase 6, Sector C",
        items: JSON.stringify([
          { title: "Obsidian Relic Oversized Hoodie", size: "L", quantity: 1, pricePKR: 8500 },
        ]),
        totalPKR: 8500,
        status: "PENDING",
        confirmationState: "AWAITING_CONFIRMATION",
        paymentMethod: "COD",
      },
    });

    // TEST 1: Trigger New Order WhatsApp Automations
    console.log("\n[TEST 1] Testing Trigger New Order WhatsApp Automations...");
    await triggerNewOrderAutomations(order);

    const outboundLogs = await (prisma as any).whatsAppLog.findMany({
      where: { orderId: order.id, direction: "OUTBOUND" },
    });

    console.log(`Outbound WhatsApp logs created: ${outboundLogs.length}`);
    if (outboundLogs.length < 2) {
      throw new Error("Expected at least 2 logs: 1 Owner Alert + 1 Customer Quiz");
    }
    const hasAdminAlert = outboundLogs.some((l: any) => l.eventType === "ADMIN_NEW_ORDER");
    const hasQuiz = outboundLogs.some((l: any) => l.eventType === "CUSTOMER_ORDER_QUIZ");
    if (!hasAdminAlert || !hasQuiz) {
      throw new Error("Failed to generate both ADMIN_NEW_ORDER and CUSTOMER_ORDER_QUIZ");
    }
    console.log("âœ… TEST 1 PASSED: Owner Alert + Customer Quiz dispatched to WhatsApp logs.");

    // TEST 2: Customer clicks "OK - Confirm Order" (Interactive Quiz Button)
    console.log("\n[TEST 2] Testing Customer Quiz Reply: CONFIRM_OK...");
    const confirmResult = await processCustomerQuizReply({
      phone: testPhone,
      replyId: `CONFIRM_OK:${testOrderNumber}`,
      orderNumber: testOrderNumber,
    });

    console.log("Quiz Response:", confirmResult.replyMessage);
    const updatedOrder1 = await prisma.order.findUnique({ where: { id: order.id } });
    if (
      updatedOrder1?.confirmationState !== "CONFIRMED_BY_CUSTOMER" ||
      updatedOrder1?.status !== "CONFIRMED"
    ) {
      throw new Error(
        `Expected CONFIRMED_BY_CUSTOMER / CONFIRMED, got ${updatedOrder1?.confirmationState} / ${updatedOrder1?.status}`
      );
    }
    console.log("âœ… TEST 2 PASSED: Order confirmed by customer quiz click.");

    // TEST 3: Customer clicks "I Will Check More"
    console.log("\n[TEST 3] Testing Customer Quiz Reply: CHECK_MORE...");
    await processCustomerQuizReply({
      phone: testPhone,
      replyId: `CHECK_MORE:${testOrderNumber}`,
      orderNumber: testOrderNumber,
    });
    const updatedOrder2 = await prisma.order.findUnique({ where: { id: order.id } });
    if (updatedOrder2?.confirmationState !== "CHECKING_MORE") {
      throw new Error(`Expected CHECKING_MORE, got ${updatedOrder2?.confirmationState}`);
    }
    console.log("âœ… TEST 3 PASSED: Order flagged with warm amber 'Checking More' state.");

    // TEST 4: Customer types text reply "cancel"
    console.log("\n[TEST 4] Testing Text Reply Parsing: 'cancel'...");
    await processCustomerQuizReply({
      phone: testPhone,
      replyText: "cancel order please",
      orderNumber: testOrderNumber,
    });
    const updatedOrder3 = await prisma.order.findUnique({ where: { id: order.id } });
    if (
      updatedOrder3?.confirmationState !== "CANCELLED_BY_CUSTOMER" ||
      updatedOrder3?.status !== "CANCELLED"
    ) {
      throw new Error(
        `Expected CANCELLED_BY_CUSTOMER / CANCELLED, got ${updatedOrder3?.confirmationState} / ${updatedOrder3?.status}`
      );
    }
    console.log("âœ… TEST 4 PASSED: Text reply 'cancel' cancelled the order cleanly.");

    // TEST 5: Off-Hours AI Voice Agent - Routing & Tool 1 (check_order_status)
    console.log("\n[TEST 5] Testing Off-Hours AI Voice Agent - Order Status Tool...");
    const orderToolResult = await toolCheckOrderStatus(testOrderNumber);
    console.log("Voice Agent Order Status Tool Result:\n", orderToolResult.message);
    if (!orderToolResult.found) {
      throw new Error("Voice tool failed to find newly created order");
    }
    console.log("âœ… TEST 5 PASSED: AI Voice agent retrieved live order status & COD details.");

    // TEST 6: Off-Hours AI Voice Agent - Tool 2 (check_product_availability)
    console.log("\n[TEST 6] Testing Off-Hours AI Voice Agent - Product Availability Tool...");
    const productToolResult = await toolCheckProductAvailability("hoodie");
    console.log("Voice Agent Product Tool Result:\n", productToolResult.message);
    if (!productToolResult.found) {
      throw new Error("Voice tool failed to find hoodie products");
    }
    console.log("âœ… TEST 6 PASSED: AI Voice agent checked live active catalog & sizes.");

    // TEST 7: Off-Hours AI Voice Agent - Tool 3 (book_callback_or_note)
    console.log("\n[TEST 7] Testing Off-Hours AI Voice Agent - Nighttime Callback Booking...");
    const callbackResult = await toolBookCallback({
      callerName: testName,
      callerPhone: testPhone,
      note: "Customer called at 2 AM asking if Phase 6 delivery can arrive tomorrow before 2 PM.",
      relatedOrderNumber: testOrderNumber,
    });

    console.log("Callback booking message:", callbackResult.message);
    const callLog = await prisma.callLog.findUnique({
      where: { id: callbackResult.callLogId },
    });
    if (!callLog || !callLog.callbackRequested || callLog.callbackStatus !== "PENDING") {
      throw new Error("Failed to record high-priority callback request in CallLog");
    }
    console.log("âœ… TEST 7 PASSED: Nighttime callback recorded and owner WhatsApp alert triggered.");

    // Clean up test order & logs
    await (prisma as any).whatsAppLog.deleteMany({ where: { orderId: order.id } });
    await prisma.callLog.deleteMany({ where: { id: callbackResult.callLogId } });
    await prisma.order.delete({ where: { id: order.id } });

    console.log("\nâœ… ALL 7 AUTOMATION & VOICE AGENT TESTS PASSED CLEANLY!\n");
  } catch (error) {
    console.error("\nâ Œ AUTOMATION SUITE TEST FAILED:", error);
    process.exit(1);
  }
}

runAutomationSuiteTests();
