/**
 * AgroBridge WhatsApp Farmer Assistant Service
 * Provides WhatsApp Business API abstraction with realistic prototype simulation,
 * number linking, preference management, event notifications, and interactive command bot.
 */

const crypto = require('crypto');

// In-memory store for WhatsApp profiles & notification logs
let linkedUsers = {
  'farmer@agrobridge.demo': {
    farmerId: 'farmer@agrobridge.demo',
    farmerName: 'Ramesh Patel',
    whatsappNumber: '+91 98260 12345',
    isLinked: true,
    registeredAt: '2026-09-01T08:00:00.000Z',
    notificationPreferences: {
      orderUpdates: true,
      paymentUpdates: true,
      driverUpdates: true,
      aiAlerts: true,
      inventoryAlerts: true
    },
    lastActiveAt: new Date().toISOString()
  }
};

let notificationLogs = [
  {
    id: 'wan_101',
    farmerId: 'farmer@agrobridge.demo',
    type: 'ORDER_RECEIVED',
    title: 'New Order Received',
    message: '📦 *New Order Received!*\nOrder: #AG1024\nProduct: Organic Hybrid Tomatoes (50 kg)\nBuyer: Rahul Sharma (Consumer)\nTotal Amount: ₹1,400\nAction: Prepare crate for pickup.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'READ',
    metadata: { orderId: 'AG1024', crop: 'Tomato', amount: 1400, qtyKg: 50 }
  },
  {
    id: 'wan_102',
    farmerId: 'farmer@agrobridge.demo',
    type: 'DRIVER_ASSIGNED',
    title: 'Driver Assigned',
    message: '🚚 *Driver Assigned!*\nDriver: Raju Yadav (+91 98261 55443)\nVehicle: Tata Ace (MP-04-HE-2194)\nETA at Farm Gate: 25 Minutes\nFarm Pickup OTP: *4829*',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: 'READ',
    metadata: { orderId: 'AG1024', driver: 'Raju Yadav', otp: '4829' }
  },
  {
    id: 'wan_103',
    farmerId: 'farmer@agrobridge.demo',
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Credited',
    message: '💳 *Payment Credited to Bank!*\nAmount: ₹1,260 (90% Direct Farmer Share)\nOrder: #AG1024\nBank: SBI A/c *******4921\nUTR: AGRO77218941092\nPlatform Fee: ₹70 | Delivery: ₹70',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'DELIVERED',
    metadata: { orderId: 'AG1024', payout: 1260, utr: 'AGRO77218941092' }
  },
  {
    id: 'wan_104',
    farmerId: 'farmer@agrobridge.demo',
    type: 'AI_MARKET_ALERT',
    title: 'AI Market Alert',
    message: '📈 *AI Market Alert:*\nTomato demand is showing an increasing trend (+28%) in your Bhopal/Indore region.\nMinimum Safe Price: ₹24/kg.\nSuggested action: Review your available stock and list Grade A lot.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'DELIVERED',
    metadata: { crop: 'Tomato', trend: 'UP', minPrice: 24 }
  }
];

class WhatsAppService {
  getProfile(farmerId) {
    if (!linkedUsers[farmerId]) {
      linkedUsers[farmerId] = {
        farmerId,
        farmerName: 'Farmer Partner',
        whatsappNumber: '+91 98260 12345',
        isLinked: false,
        registeredAt: new Date().toISOString(),
        notificationPreferences: {
          orderUpdates: true,
          paymentUpdates: true,
          driverUpdates: true,
          aiAlerts: true,
          inventoryAlerts: true
        },
        lastActiveAt: new Date().toISOString()
      };
    }
    return linkedUsers[farmerId];
  }

  connectNumber(farmerId, { whatsappNumber, notificationPreferences, farmerName }) {
    const profile = this.getProfile(farmerId);
    profile.whatsappNumber = whatsappNumber || profile.whatsappNumber;
    profile.isLinked = true;
    profile.lastActiveAt = new Date().toISOString();
    if (farmerName) profile.farmerName = farmerName;
    if (notificationPreferences) {
      profile.notificationPreferences = {
        ...profile.notificationPreferences,
        ...notificationPreferences
      };
    }
    linkedUsers[farmerId] = profile;

    // Send welcome confirmation notification
    const welcomeNotif = {
      id: 'wan_' + Date.now(),
      farmerId,
      type: 'AI_MARKET_ALERT',
      title: 'WhatsApp Assistant Connected',
      message: `✅ *AgroBridge WhatsApp Assistant Connected!*\nNamaste ${profile.farmerName}! Your WhatsApp number ${profile.whatsappNumber} is now linked.\nYou will receive real-time order updates, instant payment receipts, driver OTPs, and AI market alerts.\n\nReply *HELP* at any time to see available commands.`,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      metadata: { action: 'CONNECT' }
    };
    notificationLogs.unshift(welcomeNotif);

    return {
      success: true,
      profile,
      message: 'WhatsApp linked successfully. Connected to AgroBridge notification engine (Prototype Simulation).'
    };
  }

  getNotifications(farmerId) {
    return notificationLogs.filter(n => n.farmerId === farmerId || farmerId === 'farmer@agrobridge.demo');
  }

  sendNotification(farmerId, { type, title, message, metadata = {} }) {
    const profile = this.getProfile(farmerId);
    if (!profile.isLinked) {
      return { success: false, reason: 'Farmer WhatsApp not linked' };
    }

    const newNotif = {
      id: 'wan_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      farmerId,
      type: type || 'ORDER_RECEIVED',
      title: title || 'AgroBridge Alert',
      message: message || 'You have a new update from AgroBridge.',
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      metadata
    };

    notificationLogs.unshift(newNotif);
    return {
      success: true,
      notification: newNotif,
      simulationMode: true,
      apiProvider: 'Twilio / Meta WhatsApp Business API Abstraction'
    };
  }

  sendTestNotification(farmerId) {
    const sampleAlerts = [
      {
        type: 'ORDER_RECEIVED',
        title: 'Test: New Order Received',
        message: '📦 *[TEST] New Order Received!*\nOrder: #AG1028\nProduct: Fresh Nasik Red Onions (100 kg)\nBuyer: GreenGrocer Retail, Arera Colony\nTotal Amount: ₹2,400\nFarmer Payout (90%): ₹2,160.'
      },
      {
        type: 'PAYMENT_RECEIVED',
        title: 'Test: Payment Received',
        message: '💳 *[TEST] Payment Transferred!*\nAmount: ₹4,500 credited to Bank.\nUTR: AGRO88392019\nOrder #AG1025 completed with 0 dispute.'
      },
      {
        type: 'AI_MARKET_ALERT',
        title: 'Test: AI Market Alert',
        message: '📈 *[TEST] AI Market Alert:*\nTomato demand is showing an increasing trend (+28%) in your region.\nConsider reviewing your available stock and pricing.'
      }
    ];

    const pick = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    return this.sendNotification(farmerId, pick);
  }

  processCommand(farmerId, rawCommand) {
    const cmd = (rawCommand || '').trim().toLowerCase();
    const profile = this.getProfile(farmerId);
    profile.lastActiveAt = new Date().toISOString();

    let reply = '';
    let category = 'GENERAL';

    if (cmd.includes('my orders') || cmd === 'orders') {
      category = 'ORDER';
      reply = `📦 *Your Recent AgroBridge Orders:*\n\n1. *#AG1024*: Tomato (50 kg) ➔ Out for Delivery 🚚\n2. *#AG1018*: Potato (120 kg) ➔ Delivered & Paid ✅ (₹2,160)\n3. *#AG1012*: Onion (200 kg) ➔ Delivered & Paid ✅ (₹4,400)\n\nReply *Order status* for live tracking.`;
    } else if (cmd.includes('order status') || cmd === 'status' || cmd.includes('order')) {
      category = 'ORDER';
      reply = `*Order #AG1024*\nProduct: Tomato\nQuantity: 50 kg\nBuyer: Customer\nStatus: Out for Delivery\nDriver: Assigned (Raju Yadav)\nEstimated Delivery: 35 minutes\nFarm Pickup OTP: *4829*`;
    } else if (cmd.includes('my products') || cmd.includes('products') || cmd.includes('stock')) {
      category = 'PRODUCTS';
      reply = `🌾 *Your Active Farm Listings:*\n\n1. *Organic Hybrid Tomatoes*: 850 kg available @ ₹28/kg (Grade A+)\n2. *Fresh Chandramukhi Potatoes*: 1,200 kg available @ ₹20/kg (Grade A)\n3. *Nasik Red Onions*: 650 kg available @ ₹24/kg (Grade A)\n\nAll listings are live in the AgroBridge marketplace.`;
    } else if (cmd.includes("today's sales") || cmd.includes('today sales') || cmd === 'sales') {
      category = 'FINANCE';
      reply = `💰 *Today's Sales Summary (September 2026):*\n\n• Orders Fulfilled: 4\n• Total Weight Sold: 320 kg\n• Gross Sales: ₹8,960\n• Net Farmer Realization: ₹8,064 (90%)\n• Pending Payments: ₹0.00 (All direct escrow settled)`;
    } else if (cmd.includes('my earnings') || cmd.includes('earnings') || cmd.includes('profit')) {
      category = 'FINANCE';
      reply = `💵 *Monthly Earnings & Profit (September 2026):*\n\n• Monthly Gross Sales: ₹45,000\n• Platform Payout Received: ₹40,500\n• Farm Operating Expenses: ₹12,000\n• Estimated Net Profit: *₹33,000*\n• Net Profit Margin: *73.3%*\n\n(Figures calculated transparently after platform fees & input costs)`;
    } else if (cmd.includes('add product') || cmd.includes('new product')) {
      category = 'ACTION';
      reply = `➕ *Add New Crop Harvest:*\n\nTo list a harvest, send in format:\n*[CROP] [QUANTITY_KG] [PRICE_PER_KG]*\n\nExample:\n*Tomato 200 28*\n\nOr open your Farmer Dashboard: http://localhost:3000/farmer/dashboard to upload crop photos for AI Computer Vision Grade A certification.`;
    } else if (cmd.includes('ai insights') || cmd.includes('insights') || cmd.includes('demand') || cmd.includes('forecast')) {
      category = 'AI';
      reply = `🤖 *AI Market & Demand Intelligence:*\n\n• *Tomato:* High demand trend (+28%). Regional mandi prices rising to ₹34/kg. Minimum safe price is ₹24/kg.\n• *Potato:* Steady demand. Bulk buyers actively seeking Grade A lots.\n• *Advisory:* Monsoon showers forecasted over Bhopal corridor. Expedite harvesting of ripe vegetables.`;
    } else {
      category = 'HELP';
      reply = `🌾 *AgroBridge Farmer WhatsApp Assistant*\n\nYou can reply with any of these commands:\n\n• *My orders* - View all recent orders\n• *Order status* - Track active delivery\n• *My products* - Check available inventory\n• *Today's sales* - Today's volume & payout\n• *My earnings* - Monthly revenue & profit\n• *Add product* - How to list new produce\n• *AI insights* - Market alerts & price trends\n• *Help* - Show this menu\n\n_AgroBridge: Direct Farm to Buyer | Zero Middlemen_`;
    }

    return {
      success: true,
      query: rawCommand,
      category,
      response: reply,
      sender: 'AgroBridge WhatsApp Bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSimulation: true
    };
  }
}

module.exports = new WhatsAppService();
