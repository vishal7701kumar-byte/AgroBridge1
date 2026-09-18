/**
 * AgroBridge IVR / Missed Call Farmer Telephony Service
 * Inclusive voice automation for keypad phone smallholders.
 * Handles Toll-Free Missed Call, Automated Callback, DTMF 1-5 Menu,
 * and Text-to-Speech Response Synthesis.
 */

let callSessions = [];

const TOLL_FREE_NUMBER = '1800-AGRO-BRIDGE (1800-247-6274)';

const IVR_MENU = [
  { key: '1', label: 'Latest Order Status', description: 'Press 1 for latest order status.' },
  { key: '2', label: "Today's Sales", description: "Press 2 for today's sales." },
  { key: '3', label: 'Payment Information', description: 'Press 3 for payment information.' },
  { key: '4', label: 'AI Market Alert', description: 'Press 4 for AI market alert.' },
  { key: '5', label: 'Customer Support', description: 'Press 5 for customer support.' }
];

const MENU_RESPONSES = {
  '1': {
    label: 'Latest Order Status',
    hindi: 'नमस्ते किसान भाई। आपका ऑर्डर नंबर ए-जी 1024, 50 किलोग्राम टमाटर, वर्तमान में आउट फॉर डिलीवरी है। ड्राइवर राजू यादव अगले 35 मिनट में खरीदार तक पहुंचा रहे हैं।',
    english: 'Welcome to AgroBridge. Your order AG1024 for 50 kilograms of Tomato is currently out for delivery. Driver Raju Yadav is estimated to reach the customer in 35 minutes.',
    summary: 'Order #AG1024 (50 kg Tomato) is currently Out for Delivery. Driver: Raju Yadav (MP-04-HE-2194).'
  },
  '2': {
    label: "Today's Sales",
    hindi: 'आज की बिक्री का विवरण: आपके कुल 4 ऑर्डर्स पूरे हो चुके हैं। 320 किलोग्राम उपज बिकी है और कुल 8,960 रुपये का कारोबार हुआ है।',
    english: "Today's sales summary: 4 orders fulfilled totaling 320 kilograms. Total sales value is 8,960 rupees.",
    summary: "Today's sales: 4 orders, 320 kg sold, ₹8,960 gross sales."
  },
  '3': {
    label: 'Payment Information',
    hindi: 'भुगतान स्थिति: आपका पिछला भुगतान 8,450 रुपये सीधे आपके एसबीआई बैंक खाते में ट्रांसफर कर दिया गया है। यूटीआर नंबर है ए-जी-आर-ओ 772189। कोई बकाया नहीं है।',
    english: 'Payment information: Your last direct bank payout of 8,450 rupees was credited to your SBI account via UTR AGRO77218941092. Zero pending dues.',
    summary: 'Payment: ₹8,450 credited to SBI A/c *******4921 via UTR AGRO77218941092.'
  },
  '4': {
    label: 'AI Market Alert',
    hindi: 'एआई मंडी अलर्ट: भोपाल और इंदौर मंडी में टमाटर की मांग 28 प्रतिशत बढ़ी है। आपका न्यूनतम सुरक्षित मूल्य 24 रुपये प्रति किलो है। कृपया भाव कम न करें।',
    english: 'AI Market Alert: Tomato demand in regional mandis is up 28 percent. Your minimum safe price floor is 24 rupees per kilogram.',
    summary: 'AI Market Alert: Tomato demand up +28%. Minimum safe price is ₹24/kg.'
  },
  '5': {
    label: 'Customer Support',
    hindi: 'एग्रोब्रिज किसान सहायता केंद्र में आपका स्वागत है। आपकी कॉल हमारे विशेषज्ञ अधिकारी से जोड़ी जा रही है। कृपया लाइन पर बने रहें।',
    english: 'Connecting you to AgroBridge Kisan Helpline specialist. Please stay on the line for instant assistance.',
    summary: 'Connecting to AgroBridge Kisan Helpline (Toll-Free 1800-247-6274).'
  }
};

class IVRService {
  getTollFreeNumber() {
    return TOLL_FREE_NUMBER;
  }

  getMenu() {
    return IVR_MENU;
  }

  triggerMissedCall({ farmerPhone = '+91 98260 12345', farmerId = 'farmer@agrobridge.demo' }) {
    const sessionId = 'ivr_' + Date.now();

    const session = {
      id: sessionId,
      farmerPhone,
      farmerId,
      serviceNumber: TOLL_FREE_NUMBER,
      callDirection: 'MISSED_CALL',
      callStatus: 'MISSED_CALL_RECEIVED',
      selectedOption: null,
      selectedOptionLabel: null,
      voiceResponseText: 'Welcome to AgroBridge voice response system.',
      durationSeconds: 0,
      timestamp: new Date().toISOString(),
      steps: [
        { state: 'MISSED_CALL_RECEIVED', time: new Date().toISOString(), detail: `Missed call received from ${farmerPhone}` },
        { state: 'CALLBACK_INITIATED', time: new Date(Date.now() + 1500).toISOString(), detail: 'Telephony gateway initiating automated callback' }
      ]
    };

    callSessions.unshift(session);

    return {
      success: true,
      sessionId,
      farmerPhone,
      serviceNumber: TOLL_FREE_NUMBER,
      status: 'CALLBACK_INITIATED',
      message: 'Missed call registered. Initiating automated IVR voice callback (Prototype Simulation).'
    };
  }

  handleOptionSelect({ sessionId, option = '1', language = 'hi' }) {
    const session = callSessions.find(s => s.id === sessionId) || callSessions[0];
    const optionStr = String(option);
    const responseData = MENU_RESPONSES[optionStr] || MENU_RESPONSES['1'];

    const voiceText = language === 'en' ? responseData.english : responseData.hindi;

    if (session) {
      session.selectedOption = optionStr;
      session.selectedOptionLabel = responseData.label;
      session.callStatus = 'COMPLETED';
      session.voiceResponseText = voiceText;
      session.durationSeconds = 42;
      session.steps.push({
        state: 'MENU_SELECTION',
        time: new Date().toISOString(),
        detail: `Selected Option ${optionStr}: ${responseData.label}`
      });
      session.steps.push({
        state: 'COMPLETED',
        time: new Date().toISOString(),
        detail: 'Call successfully concluded with audio voice response played.'
      });
    }

    return {
      success: true,
      sessionId: session ? session.id : sessionId,
      selectedOption: optionStr,
      selectedOptionLabel: responseData.label,
      voiceResponseText: voiceText,
      summary: responseData.summary,
      callStatus: 'COMPLETED',
      language,
      provider: 'Exotel / Twilio Telephony Abstraction',
      isSimulation: true
    };
  }

  getCallHistory(farmerId) {
    if (callSessions.length === 0) {
      // Seed an initial demo session
      this.triggerMissedCall({ farmerPhone: '+91 98260 12345', farmerId });
      this.handleOptionSelect({ sessionId: callSessions[0].id, option: '1', language: 'hi' });
    }
    return callSessions;
  }
}

module.exports = new IVRService();
