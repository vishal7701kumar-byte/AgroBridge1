const http = require('http');

function postChat(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

async function run() {
  console.log("=== AGROBRIDGE AI CHATBOT LANGUAGE & CONTEXT VERIFICATION ===\n");
  let passed = 0;
  let failed = 0;

  function check(cond, title, details = "") {
    if (cond) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} -- ${details}`);
      failed++;
    }
  }

  // 1. English query
  const resEn = await postChat({ query: "What is the price of wheat?" });
  const textEn = resEn.body?.response || resEn.body?.data?.response || "";
  const langEn = resEn.body?.detectedLanguage || resEn.body?.data?.detectedLanguage;
  check(langEn === 'en', "English query detected as 'en'", `got: ${langEn}`);
  check(!DEVANAGARI_REGEX.test(textEn), "English response has NO Devanagari characters");
  check(textEn.toLowerCase().includes("wheat") && textEn.includes("₹38"), "English response contains wheat price ₹38");

  // 2. Hindi (Devanagari) query
  const resHi = await postChat({ query: "गेहूं का भाव क्या है?" });
  const textHi = resHi.body?.response || resHi.body?.data?.response || "";
  const langHi = resHi.body?.detectedLanguage || resHi.body?.data?.detectedLanguage;
  check(langHi === 'hi', "Devanagari query detected as 'hi'", `got: ${langHi}`);
  check(DEVANAGARI_REGEX.test(textHi), "Hindi response contains Devanagari characters");
  check(textHi.includes("गेहूं") && textHi.includes("₹38"), "Hindi response contains wheat price ₹38/किग्रा");

  // 3. Hinglish query
  const resHinglish = await postChat({ query: "Tomato ka price kya hoga?" });
  const textHinglish = resHinglish.body?.response || resHinglish.body?.data?.response || "";
  const langHinglish = resHinglish.body?.detectedLanguage || resHinglish.body?.data?.detectedLanguage;
  check(langHinglish === 'hinglish', "Hinglish query detected as 'hinglish'", `got: ${langHinglish}`);
  check(!DEVANAGARI_REGEX.test(textHinglish), "Hinglish response is in Roman script (no Devanagari)");
  check(textHinglish.toLowerCase().includes("tomato") && textHinglish.includes("₹28"), "Hinglish response contains tomato price ₹28/kg");

  // 4. Multi-Turn Contextual Memory (English)
  // Turn 1: "What will be the price of tomato?"
  const turn1En = await postChat({ query: "What will be the price of tomato?" });
  const contextTurn1 = turn1En.body?.context || {};
  check(contextTurn1.activeCrop === 'Tomato', "Context remembers activeCrop = 'Tomato'");

  // Turn 2: "What about next week?" (Omitted crop name)
  const turn2En = await postChat({
    query: "What about next week?",
    context: contextTurn1,
    conversationHistory: [{ text: "What will be the price of tomato?" }]
  });
  const textTurn2En = turn2En.body?.response || "";
  const langTurn2En = turn2En.body?.detectedLanguage;
  check(langTurn2En === 'en', "Turn 2 query 'What about next week?' detected as English");
  check(textTurn2En.toLowerCase().includes("tomato"), "Turn 2 resolves omitted crop to Tomato from context");
  check(textTurn2En.includes("7 days") && textTurn2En.includes("₹32"), "Turn 2 provides 7-day tomato forecast");

  // 5. Multi-Turn Contextual Memory (Hinglish)
  // Turn 1: "Tomato ka price kya hoga?"
  const turn1Hing = await postChat({ query: "Tomato ka rate kya hai?" });
  // Turn 2: "Aur agle hafte?"
  const turn2Hing = await postChat({
    query: "Aur agle hafte?",
    context: turn1Hing.body?.context,
    conversationHistory: [{ text: "Tomato ka rate kya hai?" }]
  });
  const textTurn2Hing = turn2Hing.body?.response || "";
  const langTurn2Hing = turn2Hing.body?.detectedLanguage;
  check(langTurn2Hing === 'hinglish', "Turn 2 'Aur agle hafte?' detected as Hinglish");
  check(textTurn2Hing.toLowerCase().includes("tomato"), "Turn 2 Hinglish resolves crop to Tomato");
  check(textTurn2Hing.includes("₹32") || textTurn2Hing.includes("36"), "Turn 2 Hinglish provides forecast");

  // 6. Topics check: Quality Scanner, Order Tracking, Negotiation, Payments
  const resQuality = await postChat({ query: "How does the AI Quality Scanner work?" });
  check(resQuality.body?.response?.includes("Grade A"), "Quality query explains Grade A & AgroBridge Assured");

  const resTrack = await postChat({ query: "How can I track my delivery?" });
  check(resTrack.body?.response?.includes("Leaflet") || resTrack.body?.response?.includes("3-point"), "Tracking query explains 3-point live tracking");

  const resNego = await postChat({ query: "Smart negotiation bot kaise kaam karta hai?" });
  check(resNego.body?.detectedLanguage === 'hinglish' && resNego.body?.response?.toLowerCase().includes("safe price"), "Negotiation query explains Minimum Safe Price in Hinglish");

  console.log(`\n====================================================`);
  console.log(`CHATBOT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
