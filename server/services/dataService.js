/**
 * AgroBridge Central Data Service:
 * Products CRUD, Orders, Deliveries Lifecycle, Notifications, AI Pricing,
 * Demand Forecast, TSP Route Optimization, and Multi-Party Escrow Settlement.
 */

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dlat = (lat2 - lat1) * (Math.PI / 180);
  const dlon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dlon / 2) *
      Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const CATEGORY_FALLBACK_IMAGES = {
  'Vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  'Grains': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  'Pulses': 'https://images.unsplash.com/photo-1585996746979-3d0773d4ee71?w=600&auto=format&fit=crop&q=80',
  'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
  'Seasonal': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  'Spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
  'Organic': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80'
};

function isCleanImageUrl(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (s.length < 5) return false;
  if (s === 'undefined' || s === 'null') return false;
  if (/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(s)) return false;
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/uploads/') ||
    s.startsWith('uploads/') ||
    s.startsWith('/assets/') ||
    s.startsWith('blob:')
  );
}

let products = [
  {
    id: 'prod_1',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    name: 'Organic Hybrid Tomatoes',
    product_name: 'Organic Hybrid Tomatoes',
    category: 'Vegetables',
    quantity: 850,
    quantity_kg: 850,
    available_kg: 850,
    unit: 'kg',
    price: 28,
    price_per_kg: 28,
    marketPrice: 36,
    regionalAveragePrice: 33,
    mandi_price: 22,
    quality: 'Grade A+',
    shelf_life_days: 6,
    harvest_date: 'Today 6:00 AM',
    location: 'Berasia Road, Bhopal',
    district: 'Bhopal',
    lat: 23.4000,
    lon: 77.4300,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', alt: 'Fresh vine tomatoes on branch' },
      { url: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?w=600&auto=format&fit=crop&q=80', alt: 'Ripe red harvested organic tomatoes' },
      { url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80', alt: 'Crate of farm fresh tomatoes' }
    ],
    description: 'Vine-ripened, chemical-free organic hybrid tomatoes with high juice content and firm pulp. Direct farm gate harvest.'
  },
  {
    id: 'prod_2',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    name: 'Sharbati Premium Wheat',
    product_name: 'Sharbati Premium Wheat',
    category: 'Grains',
    quantity: 2500,
    quantity_kg: 2500,
    available_kg: 2500,
    unit: 'kg',
    price: 38,
    price_per_kg: 38,
    marketPrice: 48,
    regionalAveragePrice: 44,
    mandi_price: 31,
    quality: 'Grade A',
    shelf_life_days: 180,
    harvest_date: 'Harvested this week',
    location: 'Berasia Road, Bhopal',
    district: 'Bhopal',
    lat: 23.4000,
    lon: 77.4300,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', alt: 'Golden harvested wheat grains' },
      { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', alt: 'Fresh organic wheat spikes in sunlight' }
    ],
    description: 'Golden, heavy grain Sharbati wheat grown in the black fertile soil of the Sehore/Bhopal agrarian belt.'
  },
  {
    id: 'prod_3',
    farmer_id: 'farmer_2',
    farmer_name: 'Anita Bai',
    farm_name: 'Anita Bai Organic Farms',
    name: 'Crunchy Seedless Cucumbers',
    product_name: 'Crunchy Seedless Cucumbers',
    category: 'Vegetables',
    quantity: 600,
    quantity_kg: 600,
    available_kg: 600,
    unit: 'kg',
    price: 25,
    price_per_kg: 25,
    marketPrice: 35,
    regionalAveragePrice: 32,
    mandi_price: 35,
    quality: 'Grade A',
    shelf_life_days: 7,
    harvest_date: 'Today 5:30 AM',
    location: 'Gulabganj, Vidisha',
    district: 'Vidisha',
    lat: 23.5251,
    lon: 77.8081,
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80', alt: 'Crisp green farm cucumbers' },
      { url: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=600&auto=format&fit=crop&q=80', alt: 'Fresh sliced cucumbers' }
    ],
    description: 'Hydroponic and green-shade net grown crisp cucumbers with thin skin and zero bitterness.'
  },
  {
    id: 'prod_4',
    farmer_id: 'farmer_3',
    farmer_name: 'Mukesh Yadav',
    farm_name: 'Yadav Krishi Farm',
    name: 'Red Nashik Onions',
    product_name: 'Red Nashik Onions',
    category: 'Vegetables',
    quantity: 1800,
    quantity_kg: 1800,
    available_kg: 1800,
    unit: 'kg',
    price: 26,
    price_per_kg: 26,
    marketPrice: 34,
    regionalAveragePrice: 31,
    mandi_price: 21,
    quality: 'Grade A',
    shelf_life_days: 30,
    harvest_date: 'Yesterday',
    location: 'Mandideep, Raisen',
    district: 'Raisen',
    lat: 23.0800,
    lon: 77.5200,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80', alt: 'Farm cured red onions' },
      { url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80', alt: 'Harvested organic onions pile' }
    ],
    description: 'Cured red onions with tight multi-layer skin, long shelf life, pungent aroma, and high culinary value.'
  },
  {
    id: 'prod_5',
    farmer_id: 'farmer_4',
    farmer_name: 'Suresh Verma',
    farm_name: 'Verma Co-operative Fields',
    name: 'Yellow Soya Beans',
    product_name: 'Yellow Soya Beans',
    category: 'Grains',
    quantity: 3200,
    quantity_kg: 3200,
    available_kg: 3200,
    unit: 'kg',
    price: 46,
    price_per_kg: 46,
    marketPrice: 56,
    regionalAveragePrice: 52,
    mandi_price: 39,
    quality: 'Grade A',
    shelf_life_days: 120,
    harvest_date: '3 days ago',
    location: 'Ichhawar, Sehore',
    district: 'Sehore',
    lat: 23.2032,
    lon: 77.0844,
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&auto=format&fit=crop&q=80', alt: 'Clean yellow soybeans' }
    ],
    description: 'High-protein certified JS-335 yellow soybean seeds, optimal for home soymilk, tofu, and oil processing.'
  },
  {
    id: 'prod_6',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    name: 'Farm-Fresh Golden Potatoes',
    product_name: 'Farm-Fresh Golden Potatoes',
    category: 'Vegetables',
    quantity: 1200,
    quantity_kg: 1200,
    available_kg: 1200,
    unit: 'kg',
    price: 22,
    price_per_kg: 22,
    marketPrice: 30,
    regionalAveragePrice: 28,
    mandi_price: 18,
    quality: 'Grade A',
    shelf_life_days: 45,
    harvest_date: '2 days ago',
    location: 'Berasia Road, Bhopal',
    district: 'Bhopal',
    lat: 23.4000,
    lon: 77.4300,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', alt: 'Fresh harvested potatoes' },
      { url: 'https://images.unsplash.com/photo-1590165482129-1b8b27698980?w=600&auto=format&fit=crop&q=80', alt: 'Raw organic unpeeled potatoes' }
    ],
    description: 'Freshly dug organic Kufri Jyoti potatoes. Thin skin, starchy texture, zero cold-storage spoilage.'
  },
  {
    id: 'prod_7',
    farmer_id: 'farmer_2',
    farmer_name: 'Anita Bai',
    farm_name: 'Anita Bai Organic Farms',
    name: 'Organic Baby Spinach (Palak)',
    product_name: 'Organic Baby Spinach (Palak)',
    category: 'Vegetables',
    quantity: 400,
    quantity_kg: 400,
    available_kg: 400,
    unit: 'kg',
    price: 32,
    price_per_kg: 32,
    marketPrice: 45,
    regionalAveragePrice: 40,
    mandi_price: 24,
    quality: 'Grade A+',
    shelf_life_days: 3,
    harvest_date: 'Today 5:00 AM',
    location: 'Gulabganj, Vidisha',
    district: 'Vidisha',
    lat: 23.5251,
    lon: 77.8081,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80', alt: 'Lush green baby spinach leaves' }
    ],
    description: 'Tender baby spinach leaves washed with ozone water. Iron-rich, zero chemical spray, picked before dawn.'
  },
  {
    id: 'prod_8',
    farmer_id: 'farmer_3',
    farmer_name: 'Mukesh Yadav',
    farm_name: 'Yadav Krishi Farm',
    name: 'Sweet Crunchy Red Carrots',
    product_name: 'Sweet Crunchy Red Carrots',
    category: 'Vegetables',
    quantity: 900,
    quantity_kg: 900,
    available_kg: 900,
    unit: 'kg',
    price: 34,
    price_per_kg: 34,
    marketPrice: 46,
    regionalAveragePrice: 42,
    mandi_price: 26,
    quality: 'Grade A+',
    shelf_life_days: 10,
    harvest_date: 'Today 6:30 AM',
    location: 'Mandideep, Raisen',
    district: 'Raisen',
    lat: 23.0800,
    lon: 77.5200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80', alt: 'Bunch of freshly harvested carrots' }
    ],
    description: 'Juicy desi red carrots, naturally sweet and rich in beta-carotene. Ideal for fresh juice and cooking.'
  },
  {
    id: 'prod_9',
    farmer_id: 'farmer_4',
    farmer_name: 'Suresh Verma',
    farm_name: 'Verma Co-operative Fields',
    name: 'Shimla Crisp Royal Apples',
    product_name: 'Shimla Crisp Royal Apples',
    category: 'Fruits',
    quantity: 750,
    quantity_kg: 750,
    available_kg: 750,
    unit: 'kg',
    price: 110,
    price_per_kg: 110,
    marketPrice: 150,
    regionalAveragePrice: 135,
    mandi_price: 90,
    quality: 'Grade A+',
    shelf_life_days: 25,
    harvest_date: 'Harvested 2 days ago',
    location: 'Kolar Road Cluster, Bhopal',
    district: 'Bhopal',
    lat: 23.1800,
    lon: 77.4200,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80', alt: 'Crisp red apples in orchard' }
    ],
    description: 'Direct-orchard sweet Royal Delicious apples with crisp crunch, zero artificial wax coating.'
  },
  {
    id: 'prod_10',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    name: 'Robusta Golden Bananas',
    product_name: 'Robusta Golden Bananas',
    category: 'Fruits',
    quantity: 600,
    quantity_kg: 600,
    available_kg: 600,
    unit: 'kg',
    price: 36,
    price_per_kg: 36,
    marketPrice: 50,
    regionalAveragePrice: 45,
    mandi_price: 28,
    quality: 'Grade A',
    shelf_life_days: 5,
    harvest_date: 'Yesterday',
    location: 'Berasia Road, Bhopal',
    district: 'Bhopal',
    lat: 23.4000,
    lon: 77.4300,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80', alt: 'Fresh bunch of yellow bananas' }
    ],
    description: 'Naturally ripened Grand Naine bananas without carbide treatment. High potassium energy fruit.'
  },
  {
    id: 'prod_11',
    farmer_id: 'farmer_2',
    farmer_name: 'Anita Bai',
    farm_name: 'Anita Bai Organic Farms',
    name: 'Ratnagiri Alphonso Mangoes',
    product_name: 'Ratnagiri Alphonso Mangoes',
    category: 'Seasonal',
    quantity: 350,
    quantity_kg: 350,
    available_kg: 350,
    unit: 'kg',
    price: 180,
    price_per_kg: 180,
    marketPrice: 240,
    regionalAveragePrice: 220,
    mandi_price: 150,
    quality: 'Grade A+',
    shelf_life_days: 7,
    harvest_date: '2 days ago',
    location: 'Gulabganj, Vidisha',
    district: 'Vidisha',
    lat: 23.5251,
    lon: 77.8081,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80', alt: 'Aromatic yellow mangoes' }
    ],
    description: 'Aromatic king of mangoes with rich saffron pulp and distinct floral fragrance. Farm direct tree-ripened.'
  },
  {
    id: 'prod_12',
    farmer_id: 'farmer_3',
    farmer_name: 'Mukesh Yadav',
    farm_name: 'Yadav Krishi Farm',
    name: 'Aged Long Grain Basmati Rice',
    product_name: 'Aged Long Grain Basmati Rice',
    category: 'Grains',
    quantity: 2000,
    quantity_kg: 2000,
    available_kg: 2000,
    unit: 'kg',
    price: 85,
    price_per_kg: 85,
    marketPrice: 110,
    regionalAveragePrice: 100,
    mandi_price: 68,
    quality: 'Grade A+',
    shelf_life_days: 365,
    harvest_date: 'Cured 1 Year',
    location: 'Mandideep, Raisen',
    district: 'Raisen',
    lat: 23.0800,
    lon: 77.5200,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', alt: 'Long grain uncooked white basmati rice' }
    ],
    description: 'Traditional 1121 steam aged Basmati rice. Extra long slender grain with delicate aroma and fluffy non-sticky texture.'
  },
  {
    id: 'prod_13',
    farmer_id: 'farmer_4',
    farmer_name: 'Suresh Verma',
    farm_name: 'Verma Co-operative Fields',
    name: 'Organic Unpolished Toor Dal',
    product_name: 'Organic Unpolished Toor Dal',
    category: 'Pulses',
    quantity: 1400,
    quantity_kg: 1400,
    available_kg: 1400,
    unit: 'kg',
    price: 135,
    price_per_kg: 135,
    marketPrice: 175,
    regionalAveragePrice: 160,
    mandi_price: 115,
    quality: 'Grade A+',
    shelf_life_days: 180,
    harvest_date: 'This month',
    location: 'Ichhawar, Sehore',
    district: 'Sehore',
    lat: 23.2032,
    lon: 77.0844,
    image: 'https://images.unsplash.com/photo-1585996746979-3d0773d4ee71?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1585996746979-3d0773d4ee71?w=600&auto=format&fit=crop&q=80', alt: 'Raw yellow split toor lentils' }
    ],
    description: 'Native MP desi Toor Dal (Arhar). Completely unpolished without oil or water glaze, preserving natural dietary fiber.'
  },
  {
    id: 'prod_14',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    name: 'Fresh Desi Gir Cow A2 Milk',
    product_name: 'Fresh Desi Gir Cow A2 Milk',
    category: 'Dairy',
    quantity: 150,
    quantity_kg: 150,
    available_kg: 150,
    unit: 'Ltr',
    price: 65,
    price_per_kg: 65,
    marketPrice: 85,
    regionalAveragePrice: 78,
    mandi_price: 52,
    quality: 'Grade A+',
    shelf_life_days: 2,
    harvest_date: 'Milked Today 5:00 AM',
    location: 'Berasia Road, Bhopal',
    district: 'Bhopal',
    lat: 23.4000,
    lon: 77.4300,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80', alt: 'Fresh farm milk in glass bottle' }
    ],
    description: 'Chilled unadulterated raw A2 milk from free-grazing Gir cows. Delivered cold-chain within 3 hours of morning milking.'
  }
];

// Initialize AgroBridge Assured verification & multi-photo metadata across seed inventory
products = products.map((p, index) => {
  const isHighGrade = ['prod_1', 'prod_2', 'prod_6', 'prod_7', 'prod_9', 'prod_12', 'prod_14'].includes(p.id);
  const score = isHighGrade ? (91 + (index % 6)) : (72 + (index % 12));
  const status = isHighGrade ? 'VERIFIED' : 'PENDING';
  const isAssured = isHighGrade && score >= 85;

  const images = (p.images && p.images.length > 0)
    ? p.images.map((img, i) => ({
        url: typeof img === 'string' ? img : img.url,
        alt: typeof img === 'string' ? p.product_name : (img.alt || p.product_name),
        isPrimary: i === 0
      }))
    : [{ url: p.image, alt: p.product_name, isPrimary: true }];

  const baseP = parseFloat(p.price_per_kg || p.price) || 25;
  const moq = ['Grains', 'Pulses'].includes(p.category) || ['prod_4', 'prod_6'].includes(p.id) ? 100 : 50;
  const tiers = [
    { minQty: moq, discountPct: 5, pricePerKg: Math.round(baseP * 0.95 * 10) / 10 },
    { minQty: moq * 4, discountPct: 10, pricePerKg: Math.round(baseP * 0.90 * 10) / 10 },
    { minQty: moq * 10, discountPct: 15, pricePerKg: Math.round(baseP * 0.85 * 10) / 10 },
    { minQty: moq * 20, discountPct: 20, pricePerKg: Math.round(baseP * 0.80 * 10) / 10 }
  ];

  return {
    ...p,
    minimum_bulk_order_kg: moq,
    bulkPricingTiers: tiers,
    qualityScore: score,
    qualityStatus: status,
    isAssured: isAssured,
    verificationChecks: {
      farmOriginInspected: isHighGrade,
      zeroChemicalResidue: isHighGrade,
      moistureContentOk: isHighGrade,
      sizeGradingStandard: isHighGrade,
      coldChainCompliant: isHighGrade
    },
    verifiedAt: isHighGrade ? new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() : null,
    verifiedBy: isHighGrade ? 'AgroBridge Quality Assurance Cell' : null,
    images: images,
    image: images[0].url
  };
});

let orders = [
  {
    id: 'ORD-9101',
    buyer_id: 'consumer@agrobridge.demo',
    buyer_name: 'Priya Sharma',
    buyer_role: 'CONSUMER',
    items: [
      { product_id: 'prod_1', product_name: 'Organic Hybrid Tomatoes', quantity_kg: 5, price_per_kg: 28, subtotal: 140, farm_name: 'Patel Organic Farms', farmer_id: 'farmer@agrobridge.demo' },
      { product_id: 'prod_2', product_name: 'Sharbati Premium Wheat', quantity_kg: 10, price_per_kg: 38, subtotal: 380, farm_name: 'Patel Organic Farms', farmer_id: 'farmer@agrobridge.demo' }
    ],
    total_quantity_kg: 15,
    total_amount: 520,
    delivery_address: 'Flat 402, Green Meadows Heights, Arera Colony, Bhopal',
    delivery_job_id: 'DEL-4089',
    status: 'delivered',
    payment_method: 'Escrow Protected UPI',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'ORD-9102',
    buyer_id: 'consumer@agrobridge.demo',
    buyer_name: 'Priya Sharma',
    buyer_role: 'CONSUMER',
    items: [
      { product_id: 'prod_1', product_name: 'Organic Hybrid Tomatoes', quantity_kg: 5, price_per_kg: 28, subtotal: 140, farm_name: 'Patel Organic Farms', farmer_id: 'farmer@agrobridge.demo' },
      { product_id: 'prod_3', product_name: 'Crunchy Seedless Cucumbers', quantity_kg: 4, price_per_kg: 25, subtotal: 100, farm_name: 'Anita Bai Organic Farms', farmer_id: 'farmer_2' }
    ],
    total_quantity_kg: 9,
    total_amount: 240,
    delivery_address: 'Flat 402, Green Meadows Heights, Arera Colony, Bhopal',
    delivery_job_id: 'DEL-4091',
    status: 'out_for_delivery', // pending, assigned, picked_up, out_for_delivery, delivered
    payment_method: 'Escrow Protected UPI',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  }
];

let feedbacks = [
  {
    id: 'FB-101',
    order_id: 'ORD-9101',
    product_id: 'prod_1',
    product_name: 'Organic Hybrid Tomatoes',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    consumer_id: 'consumer@agrobridge.demo',
    consumer_name: 'Priya Sharma',
    ratings: {
      quality: 5,
      farmerExperience: 5,
      packaging: 4,
      accuracy: 5
    },
    overallRating: 4.8,
    review: 'Extraordinarily fresh vine-ripened tomatoes! Juicier and far tastier than conventional market produce.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    verifiedPurchase: true
  }
];

let farmerAccountStatuses = {
  'farmer_1': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'farmer@agrobridge.demo': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'usr_farmer_01': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'farmer_2': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'anita@agrobridge.demo': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'farmer_3': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'mukesh@agrobridge.demo': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'farmer_4': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' },
  'rajesh@agrobridge.demo': { status: 'ACTIVE', unlistedUntil: null, statusReason: '', statusUpdatedAt: null, adminNotes: '' }
};

let adminActions = [
  {
    id: 'ACT-101',
    adminId: 'admin@agrobridge.demo',
    adminName: 'System Administrator',
    farmerId: 'farmer_3',
    farmerName: 'Mukesh Yadav',
    action: 'WARNING_SENT',
    reason: 'Customer complaint regarding high thermal condensation on bulk onion delivery',
    relatedComplaintIds: ['CMP-503'],
    durationDays: null,
    unlistedUntil: null,
    notes: 'Official quality warning logged in farmer history',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

let complaints = [
  {
    id: 'CMP-501',
    order_id: 'ORD-9101',
    orderId: 'ORD-9101',
    product_id: 'prod_2',
    productId: 'prod_2',
    product_name: 'Sharbati Premium Wheat',
    productName: 'Sharbati Premium Wheat',
    consumer_id: 'consumer@agrobridge.demo',
    consumerId: 'consumer@agrobridge.demo',
    consumer_name: 'Priya Sharma',
    consumerName: 'Priya Sharma',
    farmer_id: 'farmer_1',
    farmerId: 'farmer_1',
    farmer_name: 'Ramesh Patel',
    farmerName: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    issue_category: 'PACKAGING_DEFECT',
    issueCategory: 'PACKAGING_DEFECT',
    reason: 'Minor packaging issue',
    title: 'Outer jute sack had small tear on corner',
    description: 'The wheat quality is superb, but the transport bag had a minor corner tear during delivery. A few grains spilled.',
    evidence_urls: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'
    ],
    evidencePhotos: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'RESOLVED',
    severity: 'LOW',
    isVerified: true,
    is_verified: true,
    adminDecision: 'VALID',
    admin_decision: 'VALID',
    adminNotes: 'Minor packaging damage in transit. Handled with replacement credit.',
    admin_notes: 'Minor packaging damage in transit. Handled with replacement credit.',
    farmer_response: 'Apologies for the transit issue. We have switched to reinforced double-ply sacks with our transport team.',
    farmerResponse: 'Apologies for the transit issue. We have switched to reinforced double-ply sacks with our transport team.',
    farmer_responded_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 'CMP-502',
    order_id: 'ORD-9102',
    orderId: 'ORD-9102',
    product_id: 'prod_1',
    productId: 'prod_1',
    product_name: 'Organic Hybrid Tomatoes',
    productName: 'Organic Hybrid Tomatoes',
    consumer_id: 'consumer@agrobridge.demo',
    consumerId: 'consumer@agrobridge.demo',
    consumer_name: 'Priya Sharma',
    consumerName: 'Priya Sharma',
    farmer_id: 'farmer_2',
    farmerId: 'farmer_2',
    farmer_name: 'Anita Bai',
    farmerName: 'Anita Bai',
    farm_name: 'Anita Bai Organic Farms',
    issue_category: 'WRONG_QUANTITY',
    issueCategory: 'WRONG_QUANTITY',
    reason: 'Wrong quantity',
    title: 'Received 4.2 kg instead of 5 kg invoice quantity',
    description: 'Weighing scale at delivery showed 4.2 kg gross. 800 grams shortfall observed in fresh lot.',
    evidence_urls: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'
    ],
    evidencePhotos: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'
    ],
    status: 'UNDER_REVIEW',
    severity: 'MEDIUM',
    isVerified: false,
    is_verified: false,
    adminDecision: 'PENDING',
    admin_decision: 'PENDING',
    adminNotes: null,
    admin_notes: null,
    farmer_response: 'Calibrating digital scale at dispatch dock. Replacement bag will be credited.',
    farmerResponse: 'Calibrating digital scale at dispatch dock. Replacement bag will be credited.',
    farmer_responded_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'CMP-503',
    order_id: 'BORD-7001',
    orderId: 'BORD-7001',
    product_id: 'prod_4',
    productId: 'prod_4',
    product_name: 'Red Nashik Onions',
    productName: 'Red Nashik Onions',
    consumer_id: 'bulkbuyer@agrobridge.demo',
    consumerId: 'bulkbuyer@agrobridge.demo',
    consumer_name: 'Mehta Agro Wholesalers',
    consumerName: 'Mehta Agro Wholesalers',
    farmer_id: 'farmer_3',
    farmerId: 'farmer_3',
    farmer_name: 'Mukesh Yadav',
    farmerName: 'Mukesh Yadav',
    farm_name: 'Yadav Krishi Farm',
    issue_category: 'PRODUCT_QUALITY',
    issueCategory: 'PRODUCT_QUALITY',
    reason: 'Repeated poor quality complaints',
    title: 'Premature moisture condensation in onion mesh bags',
    description: 'Bulk delivery showed pre-dispatch thermal stress. Several crates had mold germination.',
    evidence_urls: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
    ],
    evidencePhotos: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
    ],
    status: 'SUBMITTED',
    severity: 'HIGH',
    isVerified: false,
    is_verified: false,
    adminDecision: 'PENDING',
    admin_decision: 'PENDING',
    adminNotes: null,
    admin_notes: null,
    farmer_response: null,
    farmerResponse: null,
    farmer_responded_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

let deliveries = [
  {
    id: 'DEL-4091',
    order_id: 'ORD-9102',
    driver_id: 'driver@agrobridge.demo',
    driver_name: 'Vikram Singh',
    driver_phone: '+91 98264 44556',
    vehicle_type: 'Pickup Truck',
    vehicle_number: 'MP 04 GA 4892',
    pickup_location: 'Patel Organic Farms, Berasia Road, Bhopal',
    dropoff_location: 'Flat 402, Green Meadows, Arera Colony, Bhopal',
    distance_km: 24.5,
    payload_kg: 9,
    payout: 450,
    status: 'out_for_delivery', // searching_driver, driver_assigned, picked_up, out_for_delivery, delivered
    pickup_otp: '4891',
    delivery_otp: '7234',
    current_gps: { lat: 23.2350, lon: 77.4120 },
    eta_minutes: 20
  }
];

let rfqs = [
  {
    id: 'RFQ-882',
    buyer_id: 'bulkbuyer@agrobridge.demo',
    buyer_name: 'Mehta Agro Wholesalers',
    commodity: 'Red Onions (Grade A)',
    quantity_tons: 10,
    target_price_per_ton: 24000,
    status: 'Active',
    quotes_received: 4,
    created_at: new Date().toISOString()
  }
];

let notifications = [
  {
    id: 'notif_1',
    recipient: 'driver@agrobridge.demo',
    role: 'DRIVER',
    title: '🚚 New Dispatch Available',
    message: 'Delivery job DEL-4091 ready for pickup at Patel Organic Farms. Payout: ₹450.',
    read: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'notif_2',
    recipient: 'farmer@agrobridge.demo',
    role: 'FARMER',
    title: '🌾 New Direct Order Received',
    message: 'Consumer Priya Sharma ordered 5kg Tomatoes. Transporter scheduled for pickup.',
    read: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'notif_bulk_init_01',
    recipient: 'farmer@agrobridge.demo',
    role: 'FARMER',
    type: 'NEW_BULK_ORDER',
    title: '📦 New Bulk Order #BORD-7000',
    message: 'Mehta Agro Wholesalers requested 500kg of Fresh Farm Tomatoes Grade A (₹17,000)',
    orderId: 'BORD-7000',
    read: false,
    timestamp: new Date().toISOString(),
    orderData: {
      id: 'BORD-7000',
      buyer_id: 'bulkbuyer@agrobridge.demo',
      buyer_name: 'Mehta Agro Wholesalers & Hotel Supplies',
      buyer_business: 'Mehta Agro Wholesalers',
      farmer_id: 'farmer@agrobridge.demo',
      farmer_name: 'Ramesh Patel',
      farm_name: 'Patel Organic Farms',
      product_id: 'prod_1',
      product_name: 'Organic Hybrid Tomatoes',
      category: 'Vegetables',
      quantity_kg: 500,
      unit_price: 34,
      total_amount: 17000,
      delivery_address: 'Warehouse #3, Mandideep Industrial Area, Bhopal, MP',
      expected_delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      notes: 'Please pack in standard plastic crates. Requires Grade A quality check.',
      status: 'FARMER_NOTIFIED'
    }
  }
];

// =============================================================
// FARMER ACCOUNT STATUS & MARKETPLACE ELIGIBILITY HELPERS
// =============================================================

function normalizeFarmerId(id) {
  if (!id) return 'farmer_1';
  const s = id.toString().toLowerCase().trim();
  if (s === 'farmer@agrobridge.demo' || s === 'usr_farmer_01' || s === 'user_farmer_1' || s === 'farmer_1') return 'farmer_1';
  if (s === 'anita@agrobridge.demo' || s === 'farmer_2') return 'farmer_2';
  if (s === 'mukesh@agrobridge.demo' || s === 'farmer_3') return 'farmer_3';
  if (s === 'rajesh@agrobridge.demo' || s === 'farmer_4') return 'farmer_4';
  return s;
}

function getFarmerName(farmerId) {
  const norm = normalizeFarmerId(farmerId);
  const names = {
    'farmer_1': 'Ramesh Patel',
    'farmer_2': 'Anita Bai',
    'farmer_3': 'Mukesh Yadav',
    'farmer_4': 'Rajesh Gurjar'
  };
  return names[norm] || 'Patel Organic Farms';
}

function getFarmerEmail(farmerId) {
  const norm = normalizeFarmerId(farmerId);
  const emails = {
    'farmer_1': 'farmer@agrobridge.demo',
    'farmer_2': 'anita@agrobridge.demo',
    'farmer_3': 'mukesh@agrobridge.demo',
    'farmer_4': 'rajesh@agrobridge.demo'
  };
  return emails[norm] || `${norm}@agrobridge.demo`;
}

function getFarmerAccountStatus(farmerId) {
  const norm = normalizeFarmerId(farmerId);
  let record = farmerAccountStatuses[norm] || farmerAccountStatuses[farmerId];
  if (!record) {
    record = {
      status: 'ACTIVE',
      unlistedUntil: null,
      statusReason: '',
      statusUpdatedAt: null,
      adminNotes: ''
    };
    farmerAccountStatuses[norm] = record;
  }

  // Check if unlistedUntil expired automatically
  if (record.status === 'TEMPORARILY_UNLISTED' && record.unlistedUntil) {
    if (new Date(record.unlistedUntil).getTime() <= Date.now()) {
      record.status = 'ACTIVE';
      record.unlistedUntil = null;
      record.statusReason = 'Temporary unlisting period completed automatically';
      record.statusUpdatedAt = new Date().toISOString();
    }
  }

  return record;
}

function isFarmerEligibleForMarketplace(farmerId) {
  const statusObj = getFarmerAccountStatus(farmerId);
  return statusObj.status === 'ACTIVE' || statusObj.status === 'WARNING';
}

function logAdminAction({ adminId, adminName, farmerId, farmerName, action, reason, relatedComplaintIds, durationDays, unlistedUntil, notes }) {
  const now = new Date().toISOString();
  const entry = {
    id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
    adminId: adminId || 'admin@agrobridge.demo',
    adminName: adminName || 'System Administrator',
    farmerId: normalizeFarmerId(farmerId),
    farmerName: farmerName || getFarmerName(farmerId),
    action: action || 'STATUS_UPDATED',
    reason: reason || 'Administrative policy update',
    relatedComplaintIds: Array.isArray(relatedComplaintIds) ? relatedComplaintIds : (relatedComplaintIds ? [relatedComplaintIds] : []),
    durationDays: durationDays || null,
    unlistedUntil: unlistedUntil || null,
    notes: notes || '',
    createdAt: now
  };
  adminActions.unshift(entry);
  return entry;
}

function getAdminAuditLogs(filter = {}) {
  let list = [...adminActions];
  if (filter.farmerId) {
    const norm = normalizeFarmerId(filter.farmerId);
    list = list.filter(a => a.farmerId === norm || a.farmerId === filter.farmerId);
  }
  if (filter.action) {
    list = list.filter(a => a.action === filter.action);
  }
  return list;
}

function updateFarmerAccountStatus(farmerId, { status, reason, duration, notes, complaintIds, adminUser } = {}) {
  const norm = normalizeFarmerId(farmerId);
  const days = parseInt(duration) || 7;
  const unlistedUntil = status === 'TEMPORARILY_UNLISTED' ? new Date(Date.now() + days * 86400000).toISOString() : null;
  const now = new Date().toISOString();

  const record = {
    status: status || 'ACTIVE',
    unlistedUntil,
    statusReason: reason || `Admin updated status to ${status}`,
    statusUpdatedAt: now,
    adminNotes: notes || ''
  };

  farmerAccountStatuses[norm] = { ...record };
  farmerAccountStatuses[farmerId] = { ...record };
  if (norm === 'farmer_1') {
    farmerAccountStatuses['farmer@agrobridge.demo'] = { ...record };
    farmerAccountStatuses['usr_farmer_01'] = { ...record };
  }

  const actionMap = {
    'WARNING': 'WARNING_SENT',
    'UNDER_REVIEW': 'UNDER_REVIEW',
    'TEMPORARILY_UNLISTED': 'UNLISTED',
    'SUSPENDED': 'SUSPENDED',
    'BANNED': 'BANNED',
    'ACTIVE': 'RESTORED'
  };
  const actionType = actionMap[status] || 'STATUS_UPDATED';

  const auditEntry = logAdminAction({
    adminId: adminUser?.email || adminUser?.id || 'admin@agrobridge.demo',
    adminName: adminUser?.name || 'System Administrator',
    farmerId: norm,
    farmerName: getFarmerName(norm),
    action: actionType,
    reason: reason || `Admin set status to ${status}`,
    relatedComplaintIds: complaintIds || [],
    durationDays: status === 'TEMPORARILY_UNLISTED' ? days : null,
    unlistedUntil,
    notes: notes || ''
  });

  // Notify farmer
  const farmerEmail = getFarmerEmail(norm);
  let notifTitle = `⚠️ Account Status Update: ${status.replace(/_/g, ' ')}`;
  let notifMsg = `Admin updated your account status to ${status.replace(/_/g, ' ')}.`;

  if (status === 'WARNING') {
    notifTitle = '⚠️ AGROBRIDGE WARNING';
    notifMsg = `A customer complaint has been reviewed and requires your attention. Category: ${reason || 'Product Quality'}. Please review and improve your service.`;
  } else if (status === 'TEMPORARILY_UNLISTED') {
    notifTitle = '⚠️ ACCOUNT TEMPORARILY UNLISTED';
    notifMsg = `Your products are currently unavailable on the AgroBridge marketplace. Reason: ${reason || 'Repeated Verified Complaints'}. Unlisted until: ${new Date(unlistedUntil).toLocaleDateString()}.`;
  } else if (status === 'UNDER_REVIEW') {
    notifTitle = '🔍 ACCOUNT UNDER REVIEW';
    notifMsg = `Your farm account is currently under quality compliance review. Reason: ${reason || 'Customer dispute tickets under inspection'}.`;
  } else if (status === 'SUSPENDED') {
    notifTitle = '⛔ ACCOUNT SUSPENDED';
    notifMsg = `Your AgroBridge account has been suspended pending review. New listings and orders are disabled.`;
  } else if (status === 'BANNED') {
    notifTitle = '🚫 ACCOUNT TERMINATED';
    notifMsg = `Your AgroBridge account has been banned due to compliance violations.`;
  }

  notifications.unshift({
    id: `notif_${Date.now()}_status`,
    recipient: farmerEmail,
    role: 'FARMER',
    type: status === 'WARNING' ? 'WARNING' : 'ACCOUNT_STATUS_CHANGE',
    title: notifTitle,
    message: notifMsg,
    status,
    unlistedUntil,
    read: false,
    timestamp: now
  });

  return { success: true, farmerId: norm, statusData: record, auditEntry };
}

function restoreFarmerStatus(farmerId, { adminUser, notes } = {}) {
  const norm = normalizeFarmerId(farmerId);
  const now = new Date().toISOString();

  const record = {
    status: 'ACTIVE',
    unlistedUntil: null,
    statusReason: 'Restored by administrator',
    statusUpdatedAt: now,
    adminNotes: notes || 'Account privileges restored'
  };

  farmerAccountStatuses[norm] = { ...record };
  farmerAccountStatuses[farmerId] = { ...record };
  if (norm === 'farmer_1') {
    farmerAccountStatuses['farmer@agrobridge.demo'] = { ...record };
    farmerAccountStatuses['usr_farmer_01'] = { ...record };
  }

  const auditEntry = logAdminAction({
    adminId: adminUser?.email || adminUser?.id || 'admin@agrobridge.demo',
    adminName: adminUser?.name || 'System Administrator',
    farmerId: norm,
    farmerName: getFarmerName(norm),
    action: 'RESTORED',
    reason: 'Account reinstated to Active standing by administrator',
    relatedComplaintIds: [],
    durationDays: null,
    unlistedUntil: null,
    notes: notes || 'Account reinstated'
  });

  const farmerEmail = getFarmerEmail(norm);
  notifications.unshift({
    id: `notif_${Date.now()}_restore`,
    recipient: farmerEmail,
    role: 'FARMER',
    type: 'ACCOUNT_RESTORED',
    title: '✅ ACCOUNT RESTORED',
    message: 'Your AgroBridge account has been restored. Your products are now visible in the marketplace.',
    status: 'ACTIVE',
    read: false,
    timestamp: now
  });

  return { success: true, farmerId: norm, statusData: record, auditEntry };
}

// Product CRUD
function getProducts(filter = {}) {
  let list = [...products];

  // CRITICAL BACKEND RULE: Exclude products from TEMPORARILY_UNLISTED, SUSPENDED, and BANNED farmers
  // Only show products where farmer is ACTIVE or WARNING (unless explicit admin view is requested)
  if (!filter.includeUnlisted && !filter.adminView) {
    list = list.filter(p => isFarmerEligibleForMarketplace(p.farmer_id));
  }
  if (filter.category && filter.category !== 'All') {
    list = list.filter(p => p.category && p.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.farmer_id) {
    list = list.filter(p => p.farmer_id === filter.farmer_id);
  }
  if (filter.assured === 'true' || filter.assured === true || filter.filter === 'assured') {
    list = list.filter(p => p.isAssured === true && p.qualityStatus === 'VERIFIED');
  }
  if (filter.filter === 'direct') {
    list = list.filter(p => Boolean(p.farmer_id));
  }
  if (filter.filter === 'nearMe') {
    list = [...list].sort((a, b) => (a.district === 'Bhopal' ? -1 : 1));
  }
  if (filter.filter === 'bestDeals') {
    list = [...list].sort((a, b) => {
      const saveA = ((a.marketPrice || a.price_per_kg * 1.25) - a.price_per_kg);
      const saveB = ((b.marketPrice || b.price_per_kg * 1.25) - b.price_per_kg);
      return saveB - saveA;
    });
  }
  if (filter.filter === 'aiRecommended') {
    list = list.filter(p => p.qualityScore >= 85 && p.isAssured);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(p =>
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.district && p.district.toLowerCase().includes(q)) ||
      (p.farmer_name && p.farmer_name.toLowerCase().includes(q)) ||
      (p.farm_name && p.farm_name.toLowerCase().includes(q))
    );
  }
  return list;
}

function addProduct(prod) {
  const farmerId = prod.farmer_id || prod.farmerId;
  const statusObj = getFarmerAccountStatus(farmerId);
  if (statusObj.status === 'TEMPORARILY_UNLISTED' || statusObj.status === 'SUSPENDED' || statusObj.status === 'BANNED') {
    return {
      error: `Action restricted: Your account is currently ${statusObj.status.replace(/_/g, ' ')}. Product creation is disabled. Reason: ${statusObj.statusReason || 'Compliance action pending'}`,
      code: 403
    };
  }

  const agroPrice = parseFloat(prod.price_per_kg || prod.price) || 25;
  const name = prod.product_name || prod.name || 'Fresh Farm Produce';
  const category = prod.category || 'Vegetables';
  const fallbackImg = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES['Vegetables'];
  const mainImage = isCleanImageUrl(prod.image) ? prod.image.trim() : fallbackImg;
  const rawImages = (Array.isArray(prod.images) && prod.images.length > 0)
    ? prod.images
    : [{ url: mainImage, alt: name, isPrimary: true }];

  const formattedImages = rawImages.map((img, idx) => {
    const rawUrl = typeof img === 'string' ? img : img.url;
    const cleanUrl = isCleanImageUrl(rawUrl) ? rawUrl.trim() : fallbackImg;
    return {
      url: cleanUrl,
      alt: typeof img === 'string' ? name : (img.alt || name),
      isPrimary: typeof img === 'object' && img.isPrimary !== undefined ? Boolean(img.isPrimary) : (idx === 0)
    };
  });

  const primaryImg = formattedImages.find(i => i.isPrimary) || formattedImages[0];
  const qScore = parseInt(prod.qualityScore, 10) || 82;
  const qStatus = prod.qualityStatus || 'PENDING';
  const isAssured = Boolean(qStatus === 'VERIFIED' && qScore >= 85);

  const moq = parseFloat(prod.minimum_bulk_order_kg) || (['Grains', 'Pulses'].includes(category) ? 100 : 50);
  const tiers = prod.bulkPricingTiers || [
    { minQty: moq, discountPct: 5, pricePerKg: Math.round(agroPrice * 0.95 * 10) / 10 },
    { minQty: moq * 4, discountPct: 10, pricePerKg: Math.round(agroPrice * 0.90 * 10) / 10 },
    { minQty: moq * 10, discountPct: 15, pricePerKg: Math.round(agroPrice * 0.85 * 10) / 10 },
    { minQty: moq * 20, discountPct: 20, pricePerKg: Math.round(agroPrice * 0.80 * 10) / 10 }
  ];

  const newProd = {
    id: `prod_${Date.now()}`,
    name,
    product_name: name,
    category,
    quantity: parseFloat(prod.quantity_kg || prod.quantity) || 100,
    quantity_kg: parseFloat(prod.quantity_kg || prod.quantity) || 100,
    available_kg: parseFloat(prod.quantity_kg || prod.quantity) || 100,
    minimum_bulk_order_kg: moq,
    bulkPricingTiers: tiers,
    unit: prod.unit || 'kg',
    price: agroPrice,
    price_per_kg: agroPrice,
    marketPrice: prod.marketPrice || Math.round(agroPrice * 1.28),
    regionalAveragePrice: prod.regionalAveragePrice || Math.round(agroPrice * 1.20),
    mandi_price: prod.mandi_price || Math.round(agroPrice * 0.78),
    quality: prod.quality || 'Grade A',
    qualityScore: qScore,
    qualityStatus: qStatus,
    isAssured: isAssured,
    verificationChecks: prod.verificationChecks || {
      farmOriginInspected: false,
      zeroChemicalResidue: false,
      moistureContentOk: false,
      sizeGradingStandard: false,
      coldChainCompliant: false
    },
    verifiedAt: isAssured ? new Date().toISOString() : null,
    verifiedBy: isAssured ? 'AgroBridge Quality Assurance Cell' : null,
    shelf_life_days: parseInt(prod.shelf_life_days) || 7,
    harvest_date: prod.harvest_date || 'Today',
    location: prod.location || 'Bhopal, MP',
    district: prod.district || 'Bhopal',
    lat: prod.lat || 23.4000,
    lon: prod.lon || 77.4300,
    farmer: prod.farmer_name || prod.farmer || 'Direct Producer',
    farmer_name: prod.farmer_name || prod.farmer || 'Direct Producer',
    farm_name: prod.farm_name || `${prod.farmer_name || 'AgroBridge'} Farm`,
    farmer_id: prod.farmer_id || 'farmer@agrobridge.demo',
    image: primaryImg ? primaryImg.url : mainImage,
    images: formattedImages,
    description: prod.description || 'Fresh harvest direct from field to consumer.',
    created_at: new Date().toISOString()
  };
  products.unshift(newProd);

  // Broadcast notification to buyers
  notifications.unshift({
    id: `notif_${Date.now()}`,
    role: 'CONSUMER',
    title: `🌱 New Produce: ${newProd.product_name}`,
    message: `${newProd.farmer_name} listed ${newProd.quantity_kg}${newProd.unit} ${newProd.product_name} at ₹${newProd.price_per_kg}/${newProd.unit}!`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return newProd;
}

function addProductImage(productId, imageData) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return null;
  if (!prod.images) prod.images = [];

  const imgObj = typeof imageData === 'string'
    ? { url: imageData, alt: prod.product_name, isPrimary: prod.images.length === 0 }
    : {
        url: imageData.url,
        alt: imageData.alt || prod.product_name,
        isPrimary: Boolean(imageData.isPrimary) || prod.images.length === 0
      };

  if (imgObj.isPrimary) {
    prod.images.forEach(img => { img.isPrimary = false; });
    prod.images.unshift(imgObj);
    prod.image = imgObj.url;
  } else {
    prod.images.push(imgObj);
  }
  return prod;
}

function setPrimaryImage(productId, imageIdentifier) {
  const prod = products.find(p => p.id === productId);
  if (!prod || !prod.images || !prod.images.length) return null;

  let targetIndex = -1;
  if (typeof imageIdentifier === 'number') {
    targetIndex = imageIdentifier;
  } else {
    targetIndex = prod.images.findIndex(img => img.url === imageIdentifier);
  }

  if (targetIndex >= 0 && targetIndex < prod.images.length) {
    prod.images.forEach((img, idx) => {
      img.isPrimary = (idx === targetIndex);
    });
    prod.image = prod.images[targetIndex].url;
  }
  return prod;
}

function removeProductImage(productId, imageIdentifier) {
  const prod = products.find(p => p.id === productId);
  if (!prod || !prod.images || !prod.images.length) return null;

  let targetIndex = -1;
  if (typeof imageIdentifier === 'number') {
    targetIndex = imageIdentifier;
  } else {
    targetIndex = prod.images.findIndex(img => img.url === imageIdentifier);
  }

  if (targetIndex >= 0 && targetIndex < prod.images.length) {
    const wasPrimary = prod.images[targetIndex].isPrimary;
    prod.images.splice(targetIndex, 1);
    if (prod.images.length > 0) {
      if (wasPrimary) {
        prod.images[0].isPrimary = true;
        prod.image = prod.images[0].url;
      }
    } else {
      const fallback = CATEGORY_FALLBACK_IMAGES[prod.category] || CATEGORY_FALLBACK_IMAGES['Vegetables'];
      prod.image = fallback;
      prod.images = [{ url: fallback, alt: prod.product_name, isPrimary: true }];
    }
  }
  return prod;
}

function verifyProductQuality(productId, { status, score, qualityScore, checks, verificationChecks, notes, adminName = 'AgroBridge QA Cell' } = {}) {
  let prod = products.find(p => p.id === productId);
  if (!prod) {
    prod = products[0];
  }
  if (!prod) return null;

  const targetScore = qualityScore !== undefined ? qualityScore : (score !== undefined ? score : prod.qualityScore || 85);
  prod.qualityScore = Math.min(100, Math.max(0, parseInt(targetScore, 10) || 0));

  if (status) {
    prod.qualityStatus = status; // 'VERIFIED' | 'REJECTED' | 'NEEDS_UPDATE' | 'PENDING'
  }
  const targetChecks = verificationChecks || checks;
  if (targetChecks) {
    prod.verificationChecks = {
      ...(prod.verificationChecks || {}),
      ...targetChecks
    };
  }
  if (notes !== undefined) {
    prod.verificationNotes = notes;
  }
  prod.verifiedBy = adminName;
  prod.verifiedAt = new Date().toISOString();
  // CRITICAL RULE: Only marked isAssured if qualityScore >= 85 AND qualityStatus === 'VERIFIED'
  prod.isAssured = (prod.qualityStatus === 'VERIFIED' && prod.qualityScore >= 85);

  return prod;
}

function updateProduct(id, updates) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;

  let updatedImages = updates.images !== undefined ? updates.images : products[idx].images;
  let updatedImage = updates.image !== undefined ? updates.image : products[idx].image;

  if (updates.images && Array.isArray(updates.images) && updates.images.length > 0) {
    const primary = updates.images.find(img => img && (img.isPrimary === true || img.is_primary === true));
    if (primary) {
      const u = typeof primary === 'string' ? primary : primary.url;
      if (isCleanImageUrl(u)) updatedImage = u.trim();
    } else {
      const first = updates.images[0];
      const u = typeof first === 'string' ? first : first?.url;
      if (isCleanImageUrl(u)) updatedImage = u.trim();
    }
  } else if (updates.image && isCleanImageUrl(updates.image)) {
    updatedImage = updates.image.trim();
    if (!updatedImages || updatedImages.length === 0) {
      updatedImages = [{ url: updatedImage, alt: products[idx].product_name, isPrimary: true }];
    }
  }

  products[idx] = {
    ...products[idx],
    ...updates,
    image: updatedImage,
    images: updatedImages,
    updated_at: new Date().toISOString()
  };
  return products[idx];
}

function deleteProduct(id) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  return products.splice(idx, 1)[0];
}

// Order operations & Smart Driver Dispatch
function createOrder(orderData) {
  // Check if any item belongs to an unlisted/suspended farmer
  if (orderData.items && orderData.items.length) {
    for (const item of orderData.items) {
      const prod = products.find(p => p.id === item.product_id || p.id === item.id);
      const fId = item.farmer_id || prod?.farmer_id;
      if (fId && !isFarmerEligibleForMarketplace(fId)) {
        return {
          error: `Product "${item.product_name || prod?.name || 'Item'}" is currently unavailable. Seller account is under review.`,
          code: 403
        };
      }
    }
  }

  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const delId = `DEL-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    delivery_job_id: delId,
    status: 'driver_assigned',
    created_at: new Date().toISOString(),
    ...orderData
  };

  orders.unshift(newOrder);

  // Deduct inventory
  if (orderData.items && orderData.items.length) {
    for (const item of orderData.items) {
      const prod = products.find(p => p.id === item.product_id || p.id === item.id);
      if (prod) {
        prod.available_kg = Math.max(0, prod.available_kg - (parseFloat(item.quantity_kg || item.quantity) || 0));
      }
    }
  }

  // Automatic delivery dispatch generation with structured geo-locations
  const farmName = orderData.items?.[0]?.farm_name || 'Patel Organic Farms';
  const pickupAddress = `${farmName}, Berasia Road, Bhopal`;
  const farmLat = orderData.items?.[0]?.lat || 23.4000;
  const farmLon = orderData.items?.[0]?.lon || 77.4300;

  const destAddress = orderData.delivery_address || orderData.deliveryAddress?.address || 'Flat 402, Green Meadows, Arera Colony, Bhopal';
  const destLat = parseFloat(orderData.deliveryAddress?.latitude || orderData.latitude || 23.2185);
  const destLon = parseFloat(orderData.deliveryAddress?.longitude || orderData.longitude || 77.4320);

  const initialDriverLat = 23.3200;
  const initialDriverLon = 77.4180;
  const distKm = haversineKm(initialDriverLat, initialDriverLon, destLat, destLon);
  const etaMinutes = Math.max(8, Math.round((distKm / 25) * 60));

  const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

  const newDelivery = {
    id: delId,
    order_id: orderId,
    driver_id: 'driver@agrobridge.demo',
    driver_name: 'Vikram Singh',
    driver_phone: '+91 98264 44556',
    vehicle_type: 'Pickup Truck (1.5 Ton)',
    vehicle_number: 'MP 04 GA 4892',
    pickup_location: pickupAddress,
    dropoff_location: destAddress,
    pickupLocation: {
      address: pickupAddress,
      latitude: farmLat,
      longitude: farmLon
    },
    deliveryLocation: {
      address: destAddress,
      latitude: destLat,
      longitude: destLon
    },
    driverLocation: {
      latitude: initialDriverLat,
      longitude: initialDriverLon,
      updatedAt: new Date().toISOString()
    },
    distance_km: distKm,
    payload_kg: orderData.total_quantity_kg || 10,
    payout: Math.max(380, Math.round((orderData.total_amount || 500) * 0.12 + 200)),
    status: 'driver_assigned', // auto-assigned for fast dispatch
    pickup_otp: pickupOtp,
    delivery_otp: deliveryOtp,
    current_gps: { lat: initialDriverLat, lon: initialDriverLon },
    eta_minutes: etaMinutes
  };

  deliveries.unshift(newDelivery);

  // Notify driver
  notifications.unshift({
    id: `notif_${Date.now()}_driver`,
    recipient: 'driver@agrobridge.demo',
    role: 'DRIVER',
    title: `🚚 New Delivery Job Dispatch: ₹${newDelivery.payout}`,
    message: `Job ${delId} available: ${newDelivery.payload_kg}kg produce from ${newDelivery.pickup_location} ➔ ${newDelivery.dropoff_location}`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { order: newOrder, delivery: newDelivery };
}

function getOrders(filter = {}) {
  let list = [...orders];
  if (filter.buyer_id) {
    list = list.filter(o => o.buyer_id === filter.buyer_id);
  }
  if (filter.farmer_id) {
    list = list.filter(o => o.items.some(i => i.farmer_id === filter.farmer_id));
  }
  return list;
}

// Delivery Lifecycle Transitions
function getDeliveries(filter = {}) {
  let list = [...deliveries];
  if (filter.driver_id) {
    list = list.filter(d => d.driver_id === filter.driver_id || d.status === 'searching_driver');
  }
  return list;
}

// Step 14: Driver accepts delivery
function acceptDelivery(deliveryId, driverUser) {
  const del = deliveries.find(d => d.id === deliveryId);
  if (!del) return null;

  del.driver_id = driverUser.email;
  del.driver_name = driverUser.name;
  del.driver_phone = driverUser.phone || '+91 98264 44556';
  del.vehicle_type = driverUser.vehicleType || del.vehicle_type;
  del.vehicle_number = driverUser.vehicleNumber || del.vehicle_number;
  del.status = 'driver_assigned';

  const ord = orders.find(o => o.id === del.order_id);
  if (ord) ord.status = 'driver_assigned';

  notifications.unshift({
    id: `notif_${Date.now()}`,
    role: 'CONSUMER',
    title: `🚚 Driver Assigned for Order ${del.order_id}`,
    message: `${del.driver_name} accepted your delivery in ${del.vehicle_type} (${del.vehicle_number}). En route to farm pickup.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return del;
}

// Step 15: Confirm Farm Pickup with OTP
function verifyPickup(deliveryId, enteredOtp) {
  const del = deliveries.find(d => d.id === deliveryId);
  if (!del) return { success: false, error: 'Delivery not found' };

  if (enteredOtp && del.pickup_otp !== enteredOtp) {
    return { success: false, error: 'Invalid Farm Pickup OTP. Please verify with the farmer.' };
  }

  del.status = 'out_for_delivery';
  del.current_gps = { lat: 23.2800, lon: 77.4100 }; // Moving toward buyer

  const ord = orders.find(o => o.id === del.order_id);
  if (ord) ord.status = 'out_for_delivery';

  notifications.unshift({
    id: `notif_${Date.now()}`,
    role: 'CONSUMER',
    title: `📦 Order ${del.order_id} Out For Delivery!`,
    message: `Produce picked up from farm gate! Transporter is en route. Use OTP: ${del.delivery_otp} at delivery.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, delivery: del };
}

// Step 17: Complete Delivery with Consumer OTP & Escrow Release
function verifyDelivery(deliveryId, enteredOtp) {
  const del = deliveries.find(d => d.id === deliveryId);
  if (!del) return { success: false, error: 'Delivery not found' };

  if (enteredOtp && del.delivery_otp !== enteredOtp) {
    return { success: false, error: 'Invalid Customer Delivery OTP.' };
  }

  del.status = 'delivered';
  del.current_gps = { lat: 23.2185, lon: 77.4320 }; // At buyer location

  const ord = orders.find(o => o.id === del.order_id);
  if (ord) {
    ord.status = 'delivered';
    ord.escrow_settled = true;
    ord.settled_at = new Date().toISOString();
  }

  notifications.unshift({
    id: `notif_${Date.now()}`,
    role: 'ALL',
    title: `✅ Delivery Completed & Escrow Released!`,
    message: `Order ${del.order_id} verified and delivered. Driver earned ₹${del.payout}. Escrow payment released to farmers.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, delivery: del, order: ord, payout: del.payout };
}

function updateDeliveryStatus(id, newStatus) {
  const del = deliveries.find(d => d.id === id);
  if (!del) return null;
  del.status = newStatus;

  const ord = orders.find(o => o.id === del.order_id);
  if (ord) ord.status = newStatus;

  return del;
}

// RFQ operations
function addRFQ(rfqData) {
  const newRfq = {
    id: `RFQ-${Math.floor(100 + Math.random() * 900)}`,
    quotes_received: 0,
    status: 'Active',
    created_at: new Date().toISOString(),
    ...rfqData
  };
  rfqs.unshift(newRfq);
  return newRfq;
}

function getRFQs() {
  return rfqs;
}

// Notifications
function getNotifications(filter = {}) {
  let list = [...notifications];
  if (filter.recipient) {
    list = list.filter(n =>
      n.recipient === filter.recipient ||
      n.recipient === 'ALL' ||
      n.role === filter.role ||
      n.role === 'ALL'
    );
  } else if (filter.role) {
    list = list.filter(n => n.role === filter.role || n.role === 'ALL');
  }
  return list;
}

function markNotificationRead(id) {
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    return notif;
  }
  return null;
}

// =============================================================
// BULK BUYER MODULE: ORDERS, NOTIFICATIONS, AI BEST DEAL & FEEDBACK
// =============================================================

let bulkOrders = [
  {
    id: 'BORD-7000',
    buyer_id: 'bulkbuyer@agrobridge.demo',
    buyer_name: 'Mehta Agro Wholesalers & Hotel Supplies',
    buyer_business: 'Mehta Agro Wholesalers',
    buyer_phone: '+91 98260 11223',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    product_id: 'prod_1',
    product_name: 'Organic Hybrid Tomatoes',
    category: 'Vegetables',
    quantity_kg: 500,
    unit_price: 34,
    total_amount: 17000,
    delivery_address: 'Warehouse #3, Mandideep Industrial Area, Bhopal, MP',
    expected_delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    notes: 'Please pack in standard plastic crates. Requires Grade A quality check.',
    status: 'FARMER_NOTIFIED',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeline: [
      { status: 'PENDING', time: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Bulk purchase requisition submitted' },
      { status: 'FARMER_NOTIFIED', time: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Farmer Ramesh Patel alerted' }
    ]
  },
  {
    id: 'BORD-7001',
    buyer_id: 'bulkbuyer@agrobridge.demo',
    buyer_name: 'Mehta Agro Wholesalers & Hotel Supplies',
    buyer_business: 'Mehta Agro Wholesalers',
    buyer_phone: '+91 98260 11223',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    product_id: 'prod_1',
    product_name: 'Organic Hybrid Tomatoes',
    category: 'Vegetables',
    quantity_kg: 500,
    unit_price: 23.8,
    total_amount: 11900,
    delivery_address: 'Wholesale Depot 4, Karond Mandi Road, Bhopal, MP',
    expected_delivery_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    notes: 'Please load in heavy-duty ventilated plastic crates.',
    status: 'DELIVERED', // PENDING, FARMER_NOTIFIED, FARMER_ACCEPTED, FARMER_DECLINED, PROCESSING, DRIVER_ASSIGNED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    delivery_job_id: 'DEL-4095',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    timeline: [
      { status: 'PENDING', time: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'Bulk purchase requisition created' },
      { status: 'FARMER_NOTIFIED', time: new Date(Date.now() - 86400000 * 3).toISOString(), note: 'Farmer Ramesh Patel alerted' },
      { status: 'FARMER_ACCEPTED', time: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(), note: 'Farmer confirmed crop harvest allocation' },
      { status: 'DRIVER_ASSIGNED', time: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Eicher 14ft dispatch assigned' },
      { status: 'PICKED_UP', time: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(), note: 'Loaded at Patel Organic Farms' },
      { status: 'OUT_FOR_DELIVERY', time: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Transit via Berasia bypass' },
      { status: 'DELIVERED', time: new Date(Date.now() - 86400000 * 1 + 10800000).toISOString(), note: 'Depot receiving dock confirmed' }
    ]
  },
  {
    id: 'BORD-7002',
    buyer_id: 'bulkbuyer@agrobridge.demo',
    buyer_name: 'Mehta Agro Wholesalers & Hotel Supplies',
    buyer_business: 'Mehta Agro Wholesalers',
    buyer_phone: '+91 98260 11223',
    farmer_id: 'farmer_3',
    farmer_name: 'Mukesh Yadav',
    farm_name: 'Yadav Krishi Farm',
    product_id: 'prod_4',
    product_name: 'Red Nashik Onions',
    category: 'Vegetables',
    quantity_kg: 1000,
    unit_price: 20.8,
    total_amount: 20800,
    delivery_address: 'Central Cold Storage, Mandideep Industrial Area, Bhopal',
    expected_delivery_date: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    notes: 'Grade A cured red onions with mesh bagging.',
    status: 'OUT_FOR_DELIVERY',
    delivery_job_id: 'DEL-4096',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
    timeline: [
      { status: 'PENDING', time: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Bulk purchase requisition created' },
      { status: 'FARMER_NOTIFIED', time: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'Farmer Mukesh Yadav notified' },
      { status: 'FARMER_ACCEPTED', time: new Date(Date.now() - 86400000 * 1 + 1800000).toISOString(), note: 'Farmer accepted wholesale order' },
      { status: 'DRIVER_ASSIGNED', time: new Date(Date.now() - 3600000 * 4).toISOString(), note: 'Driver Vikram Singh assigned' },
      { status: 'PICKED_UP', time: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Loaded at Mandideep yard' },
      { status: 'OUT_FOR_DELIVERY', time: new Date(Date.now() - 3600000 * 1).toISOString(), note: 'En route to central cold storage' }
    ]
  }
];

let bulkFeedbacks = [
  {
    id: 'BFB-801',
    order_id: 'BORD-7001',
    product_id: 'prod_1',
    product_name: 'Organic Hybrid Tomatoes',
    farmer_id: 'farmer@agrobridge.demo',
    farmer_name: 'Ramesh Patel',
    farm_name: 'Patel Organic Farms',
    buyer_id: 'bulkbuyer@agrobridge.demo',
    buyer_name: 'Mehta Agro Wholesalers & Hotel Supplies',
    buyer_business: 'Mehta Agro Wholesalers',
    ratings: {
      cropQuality: 5,
      punctuality: 5,
      packaging: 4,
      pricingFairness: 5,
      communication: 5,
      overallExperience: 5
    },
    overallRating: 4.8,
    review: 'Exceptional Grade A+ hybrid tomatoes. Crates arrived crisp, zero transport spoilage, and verified moisture test passed. Will order 10 MT weekly.',
    verifiedBuyer: true,
    buyerType: 'BULK_BUYER',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

function createBulkOrder(data) {
  const prodId = data.product_id || data.productId;
  const prod = products.find(p => p.id === prodId);
  if (!prod) {
    return { success: false, error: 'Product not found', code: 404 };
  }

  if (!isFarmerEligibleForMarketplace(prod.farmer_id)) {
    return { success: false, error: 'Product is currently unavailable as the seller is not active in the marketplace.', code: 403 };
  }

  const qty = parseFloat(data.quantity_kg || data.quantityKg || data.quantity) || 0;
  const minMoq = prod.minimum_bulk_order_kg || 50;
  if (qty < minMoq) {
    return { success: false, error: `Quantity must be at least minimum bulk order quantity of ${minMoq} kg`, code: 400 };
  }

  if (prod.available_kg < qty) {
    return { success: false, error: `Insufficient stock available (${prod.available_kg} kg available, ${qty} kg requested)`, code: 400 };
  }

  // Calculate pricing based on tiers
  let unitPrice = prod.price_per_kg;
  if (prod.bulkPricingTiers && prod.bulkPricingTiers.length > 0) {
    const sortedTiers = [...prod.bulkPricingTiers].sort((a, b) => b.minQty - a.minQty);
    const matchedTier = sortedTiers.find(t => qty >= t.minQty);
    if (matchedTier) {
      unitPrice = matchedTier.pricePerKg;
    }
  }
  const totalAmount = Math.round(unitPrice * qty);

  // Deduct inventory
  prod.available_kg = Math.max(0, prod.available_kg - qty);

  const orderId = `BORD-${Math.floor(7000 + Math.random() * 2999)}`;
  const now = new Date().toISOString();

  const newOrder = {
    id: orderId,
    buyer_id: data.buyer_id || data.buyerEmail || 'bulkbuyer@agrobridge.demo',
    buyer_name: data.buyer_name || data.buyerName || 'Mehta Agro Wholesalers & Hotel Supplies',
    buyer_business: data.buyer_business || data.buyerBusiness || 'Commercial Wholesaler',
    buyer_phone: data.buyer_phone || data.buyerPhone || '+91 98260 11223',
    farmer_id: prod.farmer_id,
    farmer_name: prod.farmer_name,
    farm_name: prod.farm_name,
    product_id: prod.id,
    product_name: prod.product_name,
    category: prod.category,
    quantity_kg: qty,
    unit_price: unitPrice,
    total_amount: totalAmount,
    delivery_address: data.delivery_address || data.deliveryAddress || 'Central Hub, Bhopal',
    expected_delivery_date: data.expected_delivery_date || data.expectedDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    notes: data.notes || '',
    status: 'FARMER_NOTIFIED', // Automatically set to notified
    created_at: now,
    updated_at: now,
    timeline: [
      { status: 'PENDING', time: now, note: 'Bulk wholesale order request submitted' },
      { status: 'FARMER_NOTIFIED', time: now, note: `Farmer ${prod.farmer_name} alerted with direct purchase request` }
    ]
  };

  bulkOrders.unshift(newOrder);

  // Send real-time notification to farmer
  notifications.unshift({
    id: `notif_${Date.now()}_bulk`,
    recipient: prod.farmer_id,
    role: 'FARMER',
    type: 'NEW_BULK_ORDER',
    orderId: newOrder.id,
    title: '🏢 New Bulk Wholesale Order Received!',
    message: `${newOrder.buyer_name} placed a bulk order for ${qty}kg of ${prod.product_name} (₹${totalAmount.toLocaleString('en-IN')}). Action required: Accept or Decline.`,
    read: false,
    timestamp: now,
    orderData: {
      orderId: newOrder.id,
      productName: prod.product_name,
      quantityKg: qty,
      unitPrice,
      totalAmount,
      buyerName: newOrder.buyer_name,
      deliveryAddress: newOrder.delivery_address,
      expectedDate: newOrder.expected_delivery_date,
      notes: newOrder.notes
    }
  });

  return { success: true, order: newOrder };
}

function getBulkOrders(filter = {}) {
  let list = [...bulkOrders];
  if (filter.buyer_id) {
    list = list.filter(o => o.buyer_id.toLowerCase() === filter.buyer_id.toLowerCase());
  }
  if (filter.farmer_id) {
    const fId = filter.farmer_id.toLowerCase();
    const isPrimaryDemoFarmer = fId === 'farmer@agrobridge.demo' || fId === 'farmer_1' || fId === 'usr_farmer_01';
    list = list.filter(o => {
      const oFarmer = (o.farmer_id || '').toLowerCase();
      const oFarmerEmail = (o.farmer_email || '').toLowerCase();
      if (isPrimaryDemoFarmer) {
        return oFarmer === 'farmer_1' || oFarmer === 'usr_farmer_01' || oFarmer === 'farmer@agrobridge.demo' || oFarmerEmail === 'farmer@agrobridge.demo';
      }
      return oFarmer === fId || oFarmerEmail === fId;
    });
  }
  if (filter.status) {
    list = list.filter(o => o.status === filter.status);
  }
  return list;
}

function getBulkOrderById(id) {
  return bulkOrders.find(o => o.id === id) || null;
}

function updateBulkOrderStatus(id, newStatus, actor = {}) {
  const order = bulkOrders.find(o => o.id === id);
  if (!order) {
    return { success: false, error: 'Bulk order not found', code: 404 };
  }

  const validStatuses = [
    'PENDING', 'FARMER_NOTIFIED', 'FARMER_ACCEPTED', 'FARMER_DECLINED',
    'PROCESSING', 'DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
  ];

  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}`, code: 400 };
  }

  const prevStatus = order.status;
  order.status = newStatus;
  const now = new Date().toISOString();
  order.updated_at = now;

  let note = `Status changed from ${prevStatus} to ${newStatus}`;

  if (newStatus === 'FARMER_ACCEPTED') {
    note = `Farmer ${order.farmer_name} accepted the bulk order. Dispatching logistics.`;
    // Create delivery job
    const delId = `DEL-${Math.floor(1000 + Math.random() * 9000)}`;
    order.delivery_job_id = delId;
    deliveries.unshift({
      id: delId,
      order_id: order.id,
      driver_id: 'driver@agrobridge.demo',
      driver_name: 'Vikram Singh',
      driver_phone: '+91 98264 44556',
      vehicle_type: order.quantity_kg > 3000 ? 'Eicher 14ft (5 Ton)' : 'Pickup Truck (1.5 Ton)',
      vehicle_number: 'MP 04 GA 4892',
      pickup_location: `${order.farm_name}, Berasia Road, Bhopal`,
      dropoff_location: order.delivery_address,
      status: 'driver_assigned',
      payload_kg: order.quantity_kg,
      payout: Math.round(order.quantity_kg * 0.8 + 400),
      pickup_otp: '4891',
      delivery_otp: '7234',
      current_gps: { lat: 23.3200, lon: 77.4180 },
      distance_km: 18.5,
      eta_minutes: 35
    });

    // Notify buyer
    notifications.unshift({
      id: `notif_${Date.now()}_buyer`,
      recipient: order.buyer_id,
      role: 'BULK_BUYER',
      title: `✅ Bulk Order #${order.id} Accepted!`,
      message: `Farmer ${order.farmer_name} has accepted your bulk order for ${order.quantity_kg}kg of ${order.product_name}. Logistics dispatched.`,
      read: false,
      timestamp: now
    });
  } else if (newStatus === 'FARMER_DECLINED') {
    note = `Farmer ${order.farmer_name} was unable to fulfill this order. Inventory restored.`;
    // Restore inventory
    const prod = products.find(p => p.id === order.product_id);
    if (prod) {
      prod.available_kg += order.quantity_kg;
    }
    // Notify buyer
    notifications.unshift({
      id: `notif_${Date.now()}_buyer_dec`,
      recipient: order.buyer_id,
      role: 'BULK_BUYER',
      title: `❌ Bulk Order #${order.id} Declined`,
      message: `Farmer ${order.farmer_name} declined your bulk order request. Any pre-authorized escrow has been reversed.`,
      read: false,
      timestamp: now
    });
  } else if (newStatus === 'DELIVERED') {
    note = `Wholesale shipment delivered to ${order.delivery_address}. Verified feedback unlocked.`;
    // Notify buyer
    notifications.unshift({
      id: `notif_${Date.now()}_del`,
      recipient: order.buyer_id,
      role: 'BULK_BUYER',
      title: `📦 Bulk Order #${order.id} Delivered!`,
      message: `Your ${order.quantity_kg}kg of ${order.product_name} has arrived. Please submit your verified wholesale feedback.`,
      read: false,
      timestamp: now
    });
  }

  order.timeline.push({
    status: newStatus,
    time: now,
    note
  });

  return { success: true, order };
}

function createBulkFeedback({ orderId, buyerEmail, buyerName, ratings, review }) {
  const order = bulkOrders.find(o => o.id === orderId);
  if (!order) {
    return { success: false, error: 'Bulk order not found', code: 404 };
  }

  // CRITICAL REQUIREMENT: Feedback can strictly ONLY be submitted after order is DELIVERED
  if (order.status !== 'DELIVERED') {
    return { success: false, error: 'Feedback can only be submitted after the order has been delivered', code: 400 };
  }

  // Verify buyer identity if provided
  if (buyerEmail && order.buyer_id.toLowerCase() !== buyerEmail.toLowerCase()) {
    return { success: false, error: 'Access denied: You can only review orders placed by your account', code: 403 };
  }

  // Check if feedback already submitted for this order
  const existing = bulkFeedbacks.find(f => f.order_id === orderId);
  if (existing) {
    return { success: false, error: 'Feedback has already been submitted for this bulk order', code: 400 };
  }

  const r = ratings || {};
  const cropQuality = Math.min(5, Math.max(1, parseFloat(r.cropQuality || r.quality) || 5));
  const punctuality = Math.min(5, Math.max(1, parseFloat(r.punctuality) || 5));
  const packaging = Math.min(5, Math.max(1, parseFloat(r.packaging) || 5));
  const pricingFairness = Math.min(5, Math.max(1, parseFloat(r.pricingFairness || r.pricing) || 5));
  const communication = Math.min(5, Math.max(1, parseFloat(r.communication) || 5));
  const overallExperience = Math.min(5, Math.max(1, parseFloat(r.overallExperience || r.overall) || 5));

  const avgRating = Math.round(
    ((cropQuality + punctuality + packaging + pricingFairness + communication + overallExperience) / 6) * 10
  ) / 10;

  const newFeedback = {
    id: `BFB-${Math.floor(800 + Math.random() * 9199)}`,
    order_id: order.id,
    product_id: order.product_id,
    product_name: order.product_name,
    farmer_id: order.farmer_id,
    farmer_name: order.farmer_name,
    farm_name: order.farm_name,
    buyer_id: order.buyer_id,
    buyer_name: buyerName || order.buyer_name,
    buyer_business: order.buyer_business,
    ratings: {
      cropQuality,
      punctuality,
      packaging,
      pricingFairness,
      communication,
      overallExperience
    },
    overallRating: avgRating,
    review: (review || '').trim() || 'High commercial grade harvest with seamless bulk procurement.',
    verifiedBuyer: true,
    buyerType: 'BULK_BUYER',
    created_at: new Date().toISOString()
  };

  bulkFeedbacks.unshift(newFeedback);

  // Notify farmer
  notifications.unshift({
    id: `notif_${Date.now()}_bfb`,
    recipient: order.farmer_id,
    role: 'FARMER',
    title: `⭐ New Verified Bulk Buyer Feedback (${avgRating}★)`,
    message: `${newFeedback.buyer_name} submitted a verified wholesale review for ${newFeedback.product_name}: "${newFeedback.review.slice(0, 60)}..."`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, feedback: newFeedback };
}

function getFarmerBulkFeedback(farmerId) {
  let list = [...bulkFeedbacks];
  if (farmerId) {
    const fId = farmerId.toLowerCase();
    const isPrimaryDemoFarmer = fId === 'farmer@agrobridge.demo' || fId === 'farmer_1' || fId === 'usr_farmer_01';
    list = list.filter(f => {
      const fbFarmer = (f.farmer_id || '').toLowerCase();
      const fbFarmerEmail = (f.farmer_email || '').toLowerCase();
      if (isPrimaryDemoFarmer) {
        return fbFarmer === 'farmer_1' || fbFarmer === 'usr_farmer_01' || fbFarmer === 'farmer@agrobridge.demo' || fbFarmerEmail === 'farmer@agrobridge.demo';
      }
      return fbFarmer === fId || fbFarmerEmail === fId;
    });
  }
  const avg = list.length
    ? Math.round((list.reduce((acc, f) => acc + f.overallRating, 0) / list.length) * 10) / 10
    : 5.0;

  return {
    success: true,
    count: list.length,
    averageRating: avg,
    feedbacks: list,
    data: list
  };
}

function calculateAIBestDeal({ product, requiredQuantity = 500, buyerLocation = 'Bhopal Central Hub', customWeights = {} } = {}) {
  const reqQty = parseFloat(requiredQuantity) || 500;
  const buyerLocStr = typeof buyerLocation === 'string' ? buyerLocation : 'Bhopal Central Hub';

  // Find candidate products
  let candidates = [...products];
  if (product) {
    const q = product.toLowerCase().trim();
    const matched = candidates.filter(p =>
      p.product_name.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    if (matched.length > 0) {
      candidates = matched;
    }
  }

  // Reference buyer lat/lon (Bhopal center)
  const buyerLat = 23.2599;
  const buyerLon = 77.4126;

  // Min and max price across candidates for relative price scoring
  const prices = candidates.map(p => {
    let price = p.price_per_kg;
    if (p.bulkPricingTiers && p.bulkPricingTiers.length) {
      const sorted = [...p.bulkPricingTiers].sort((a, b) => b.minQty - a.minQty);
      const tier = sorted.find(t => reqQty >= t.minQty);
      if (tier) price = tier.pricePerKg;
    }
    return price;
  });
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  const scoredCandidates = candidates.map(p => {
    // 1. Determine bulk price per kg
    let dealPrice = p.price_per_kg;
    let appliedDiscountPct = 0;
    if (p.bulkPricingTiers && p.bulkPricingTiers.length) {
      const sorted = [...p.bulkPricingTiers].sort((a, b) => b.minQty - a.minQty);
      const tier = sorted.find(t => reqQty >= t.minQty);
      if (tier) {
        dealPrice = tier.pricePerKg;
        appliedDiscountPct = tier.discountPct;
      }
    }

    // Distance
    const fLat = p.lat || 23.4000;
    const fLon = p.lon || 77.4300;
    const distanceKm = haversineKm(fLat, fLon, buyerLat, buyerLon);

    // 9 Factors Evaluation:
    // Factor 1: Price Score (25 pts max)
    const priceRatio = maxP === minP ? 1 : 1 - ((dealPrice - minP) / (maxP - minP));
    const priceScore = Math.round(priceRatio * 25 * 10) / 10;

    // Factor 2: Quantity Availability (15 pts max)
    const availKg = p.available_kg || p.quantity_kg || 0;
    const qtyScore = availKg >= reqQty ? 15 : Math.round((availKg / reqQty) * 15 * 10) / 10;

    // Factor 3: Distance Score (10 pts max)
    const distScore = distanceKm <= 20 ? 10 : distanceKm <= 40 ? 8 : distanceKm <= 70 ? 6 : 4;

    // Factor 4: Delivery Cost Score (10 pts max)
    const estDeliveryCost = Math.round(distanceKm * 14 + 200);
    const delCostScore = estDeliveryCost < 600 ? 10 : estDeliveryCost < 1000 ? 8 : 6;

    // Factor 5: Farmer Rating Score (10 pts max)
    const fRating = p.id === 'prod_1' || p.id === 'prod_2' ? 4.9 : (4.5 + (parseInt(p.id.replace(/\D/g, '')) % 5) * 0.1);
    const farmerRatingScore = Math.round((fRating / 5) * 10 * 10) / 10;

    // Factor 6: Quality Score (15 pts max)
    const qScore = (p.qualityScore || 85) / 100 * 15;
    const qualityScoreVal = Math.round(qScore * 10) / 10;

    // Factor 7: AgroBridge Assured Status (10 pts max)
    const assuredScore = (p.isAssured && p.qualityStatus === 'VERIFIED') ? 10 : 3;

    // Factor 8: Farmer Reliability (5 pts max)
    const reliabilityScore = ['farmer@agrobridge.demo', 'farmer_2', 'farmer_3'].includes(p.farmer_id) ? 5 : 4;

    // Total Best Deal Score (out of 100)
    const bestDealScore = Math.min(100, Math.round(
      priceScore + qtyScore + distScore + delCostScore + farmerRatingScore + qualityScoreVal + assuredScore + reliabilityScore
    ));

    const totalOrderAmount = Math.round(dealPrice * reqQty);
    const marketTotal = Math.round((p.marketPrice || dealPrice * 1.3) * reqQty);
    const estimatedSavings = Math.max(0, marketTotal - totalOrderAmount);

    return {
      productId: p.id,
      productName: p.product_name,
      category: p.category,
      farmerId: p.farmer_id,
      farmerName: p.farmer_name,
      farmName: p.farm_name,
      location: p.location,
      district: p.district,
      distanceKm,
      availableKg: availKg,
      requiredQuantityKg: reqQty,
      basePricePerKg: p.price_per_kg,
      dealPricePerKg: dealPrice,
      marketPrice: p.marketPrice || Math.round(dealPrice * 1.28),
      appliedDiscountPct,
      totalOrderAmount,
      estimatedSavings,
      qualityScore: p.qualityScore || 85,
      qualityStatus: p.qualityStatus || 'PENDING',
      isAssured: Boolean(p.isAssured),
      farmerRating: fRating,
      bestDealScore,
      factors: {
        price: { score: priceScore, max: 25, label: 'Price Competitiveness' },
        quantity: { score: qtyScore, max: 15, label: 'Stock Availability' },
        distance: { score: distScore, max: 10, label: 'Farm Proximity' },
        deliveryCost: { score: delCostScore, max: 10, label: 'Transport Efficiency' },
        farmerRating: { score: farmerRatingScore, max: 10, label: 'Farmer Track Record' },
        quality: { score: qualityScoreVal, max: 15, label: 'Lab Quality Score' },
        assured: { score: assuredScore, max: 10, label: 'AgroBridge Assured' },
        reliability: { score: reliabilityScore, max: 5, label: 'Fulfillment Reliability' }
      },
      image: p.image
    };
  });

  // Sort descending by Best Deal Score
  scoredCandidates.sort((a, b) => b.bestDealScore - a.bestDealScore);

  const topDeal = scoredCandidates[0] || null;

  return {
    searchedProduct: product || 'All Commodities',
    requiredQuantityKg: reqQty,
    buyerLocation: buyerLocStr,
    evaluatedCandidateCount: scoredCandidates.length,
    topRecommendation: topDeal ? {
      ...topDeal,
      reasonsToBuy: [
        `Optimal wholesale rate: ₹${topDeal.dealPricePerKg}/kg (${topDeal.appliedDiscountPct}% volume discount applied)`,
        topDeal.isAssured ? '✓ Verified AgroBridge Assured producer with certified testing' : 'High quality standard farm harvest',
        `Estimated wholesale savings of ₹${topDeal.estimatedSavings.toLocaleString('en-IN')} vs APMC retail markups`,
        `Short-haul transit: only ${topDeal.distanceKm} km from delivery location`,
        `High farmer satisfaction rating: ${topDeal.farmerRating}★`
      ]
    } : null,
    bestDeal: topDeal,
    comparison: scoredCandidates,
    scoringWeights: {
      price: 25,
      quantity: 15,
      distance: 10,
      deliveryCost: 10,
      farmerRating: 10,
      qualityScore: 15,
      assuredStatus: 10,
      reliability: 5
    },
    rankedDeals: scoredCandidates,
    comparisonMatrix: scoredCandidates.slice(0, 5).map(c => ({
      farmer: c.farmerName,
      farm: c.farmName,
      location: `${c.district} (${c.distanceKm} km)`,
      ratePerKg: `₹${c.dealPricePerKg}`,
      availableStock: `${c.availableKg} kg`,
      assured: c.isAssured ? '✓ Yes' : 'Pending',
      qualityScore: `${c.qualityScore}/100`,
      rating: `${c.farmerRating}★`,
      totalCost: `₹${c.totalOrderAmount.toLocaleString('en-IN')}`,
      bestDealScore: `${c.bestDealScore}/100`,
      productId: c.productId
    })),
    isAiAssisted: true,
    aiTransparencyStatement: 'Recommendation generated by AgroBridge 9-Factor Multi-Criteria Decision Analysis (MCDA) weighing price, verified quality, stock readiness, and logistics distance.',
    disclaimer: 'AI-Assisted Best Deal Match recommendation based on live multi-factor scoring. Not a financial guarantee.'
  };
}

// AI Engine 1: Dynamic Price Recommendation
function calculatePriceRecommendation(cropName, grade = 'Grade A', quantityKg = 100) {
  const baseRates = {
    'Tomato': { mandi: 22, premium: 0.27 },
    'Wheat': { mandi: 31, premium: 0.22 },
    'Onion': { mandi: 21, premium: 0.24 },
    'Soybean': { mandi: 39, premium: 0.18 },
    'Cucumber': { mandi: 20, premium: 0.25 },
    'Carrot': { mandi: 28, premium: 0.25 }
  };

  const key = Object.keys(baseRates).find(k => cropName.toLowerCase().includes(k.toLowerCase())) || 'Tomato';
  const base = baseRates[key];

  const gradeMultiplier = grade.includes('A+') ? 1.15 : grade.includes('A') ? 1.05 : 0.95;
  const mandiRate = base.mandi;
  const recommendedDirectRate = Math.round(mandiRate * (1 + base.premium) * gradeMultiplier * 10) / 10;
  const extraEarningsPerKg = Math.round((recommendedDirectRate - mandiRate) * 10) / 10;
  const totalExtraEarnings = Math.round(extraEarningsPerKg * quantityKg);

  return {
    commodity: cropName,
    grade,
    quantityKg,
    mandiBenchmarkRate: mandiRate,
    recommendedDirectRate,
    extraEarningsPerKg,
    percentageBonus: `+${Math.round(((recommendedDirectRate - mandiRate) / mandiRate) * 100)}%`,
    totalExtraEarnings,
    aiAdvisory: `Direct sale bypassing APMC commission agents realizes ₹${extraEarningsPerKg}/kg additional profit. Recommended price locks high buyer demand on AgroBridge.`
  };
}

// AI Engine 2: 7-Day Regional Demand Forecasting
function predictDemand(commodity = 'Tomato', region = 'Bhopal') {
  const baseProfiles = {
    'Tomato': { base_kg: 1800, trend: 'HIGH', growth: 1.15 },
    'Wheat': { base_kg: 4500, trend: 'STRONG', growth: 1.22 },
    'Onion': { base_kg: 2400, trend: 'STABLE', growth: 1.08 },
    'Soybean': { base_kg: 3500, trend: 'HIGH', growth: 1.16 },
    'Cucumber': { base_kg: 1200, trend: 'STEADY', growth: 1.10 }
  };

  const key = Object.keys(baseProfiles).find(k => commodity.toLowerCase().includes(k.toLowerCase())) || 'Tomato';
  const profile = baseProfiles[key];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyForecast = days.map((day, i) => {
    const weekendBoost = (i >= 4) ? 1.28 : 1.0;
    const projected = Math.round(profile.base_kg * (1 + i * 0.05) * weekendBoost);
    return {
      day,
      projected_demand_kg: projected,
      confidence_pct: Math.round((93 + (i % 3) * 2) * 10) / 10
    };
  });

  const totalDemandKg = dailyForecast.reduce((acc, d) => acc + d.projected_demand_kg, 0);

  const districtBreakdown = {
    'Bhopal': Math.round(totalDemandKg * 0.45),
    'Indore': Math.round(totalDemandKg * 0.30),
    'Sehore': Math.round(totalDemandKg * 0.15),
    'Vidisha': Math.round(totalDemandKg * 0.10)
  };

  return {
    commodity,
    region,
    trend: profile.trend,
    total_7_day_demand_kg: totalDemandKg,
    daily_forecast: dailyForecast,
    district_breakdown: districtBreakdown,
    hindi_advisory: `🔔 ${commodity} ki ${region} kshetra mein aane wale 7 dinon mein maang ${profile.trend} hai. Kisaan seedhe AgroBridge par dispatch karein.`,
    english_advisory: `High demand projected for ${commodity} in ${region} belt. Commercial buyers expected to absorb ~${totalDemandKg.toLocaleString()} kg.`
  };
}

// AI Engine 3: TSP Route Optimization
function optimizeRoute(pickups, buyerLoc, totalKg = 1000) {
  const points = (pickups && pickups.length && typeof pickups[0] === 'object' && pickups[0].lat)
    ? pickups
    : [
        { name: typeof pickups?.[0] === 'string' ? pickups[0] : 'Patel Organic Farms', lat: 23.4000, lon: 77.4300, quantity_kg: 500, farmer: 'Ramesh Patel' },
        { name: typeof pickups?.[1] === 'string' ? pickups[1] : 'Sharma Krishi Kendra', lat: 23.1500, lon: 77.5300, quantity_kg: 350, farmer: 'Anita Bai' },
        { name: typeof pickups?.[2] === 'string' ? pickups[2] : 'Chauhan Natural Farms', lat: 23.2000, lon: 77.0800, quantity_kg: 600, farmer: 'Mukesh Yadav' }
      ];

  const destination = (buyerLoc && typeof buyerLoc === 'object' && buyerLoc.lat)
    ? buyerLoc
    : { name: typeof buyerLoc === 'string' ? buyerLoc : 'FreshMart Supermarkets, Arera Colony', lat: 23.2185, lon: 77.4320 };

  // Calculate unaggregated separate trips
  const separateDistance = points.reduce((acc, p) => acc + (haversineKm(p.lat, p.lon, destination.lat, destination.lon) * 2), 0);

  // TSP multi-stop sequence
  let totalDistance = 0;
  const stops = [];
  let prev = points[0];

  points.forEach((p, idx) => {
    const dist = idx > 0 ? haversineKm(prev.lat, prev.lon, p.lat, p.lon) : 0;
    totalDistance += dist;
    stops.push({
      stop_number: idx + 1,
      type: 'PICKUP',
      location: p.name,
      farmer: p.farmer,
      quantity_kg: p.quantity_kg,
      lat: p.lat,
      lon: p.lon,
      distance_leg_km: dist
    });
    prev = p;
  });

  const finalDropDist = haversineKm(prev.lat, prev.lon, destination.lat, destination.lon);
  totalDistance += finalDropDist;
  stops.push({
    stop_number: stops.length + 1,
    type: 'DROPOFF',
    location: destination.name,
    lat: destination.lat,
    lon: destination.lon,
    distance_leg_km: finalDropDist
  });

  const totalDistanceKm = Math.round(totalDistance * 10) / 10;
  const kmSaved = Math.max(0, Math.round((separateDistance - totalDistanceKm) * 10) / 10);
  const fuelSavingsInr = Math.round(kmSaved * 12.8);
  const carbonReductionKg = Math.round(kmSaved * 0.28 * 10) / 10;

  return {
    total_stops: stops.length,
    stops,
    total_distance_km: totalDistanceKm,
    unaggregated_distance_km: Math.round(separateDistance * 10) / 10,
    km_saved: kmSaved,
    fuel_savings_inr: fuelSavingsInr,
    carbon_reduction_kg: carbonReductionKg,
    estimated_transit_hours: Math.round((totalDistanceKm / 35) * 10) / 10,
    vehicle_recommended: totalKg > 3000 ? 'Eicher 14ft (5 Ton)' : 'Pickup Truck (1.5 Ton)'
  };
}

const marketPriceService = require('./marketPriceService');

function getProductById(id) {
  return products.find(p => p.id === id) || null;
}

function getProductPriceComparison(id) {
  const prod = getProductById(id);
  if (!prod) return null;
  return marketPriceService.getProductPriceComparison(prod);
}

function getProductPriceHistory(id) {
  const prod = getProductById(id);
  if (!prod) return [];
  return marketPriceService.getProductPriceHistory(prod);
}

function getBestPricesNearYou() {
  return products
    .filter(p => isFarmerEligibleForMarketplace(p.farmer_id))
    .map(p => marketPriceService.getProductPriceComparison(p))
    .filter(Boolean)
    .sort((a, b) => b.savingsPercentage - a.savingsPercentage)
    .slice(0, 4);
}

function getOrderById(id) {
  return orders.find(o => o.id === id) || null;
}

function getDeliveryById(id) {
  return deliveries.find(d => d.id === id || d.order_id === id) || null;
}

function updateDriverLocation(driverId, coords) {
  const lat = parseFloat(coords.latitude !== undefined ? coords.latitude : coords.lat);
  const lon = parseFloat(coords.longitude !== undefined ? coords.longitude : coords.lon);
  if (isNaN(lat) || isNaN(lon)) return null;

  const now = new Date().toISOString();
  let updatedAny = false;

  deliveries.forEach(del => {
    if (!del.driver_id || del.driver_id === driverId || driverId === 'driver@agrobridge.demo') {
      del.driverLocation = { latitude: lat, longitude: lon, updatedAt: now };
      del.current_gps = { lat, lon };
      const destLat = del.deliveryLocation?.latitude || 23.2185;
      const destLon = del.deliveryLocation?.longitude || 77.4320;
      del.distance_km = haversineKm(lat, lon, destLat, destLon);
      del.eta_minutes = Math.max(2, Math.round((del.distance_km / 25) * 60));
      updatedAny = true;
    }
  });

  return { latitude: lat, longitude: lon, updatedAt: now, updatedDeliveries: updatedAny };
}

function assignSmartDriver(deliveryId) {
  const del = deliveries.find(d => d.id === deliveryId || d.order_id === deliveryId);
  if (!del) return null;

  const candidateDrivers = [
    {
      id: 'driver_1',
      email: 'driver@agrobridge.demo',
      name: 'Vikram Singh',
      phone: '+91 98264 44556',
      vehicle_type: 'Pickup Truck (1.5 Ton)',
      vehicle_number: 'MP 04 GA 4892',
      rating: 4.9,
      current_lat: 23.3200,
      current_lon: 77.4180,
      capacity_kg: 1500,
      active_deliveries: 1
    },
    {
      id: 'driver_2',
      email: 'driver2@agrobridge.demo',
      name: 'Deepak Chouhan',
      phone: '+91 94250 11223',
      vehicle_type: 'Tata Ace (1 Ton)',
      vehicle_number: 'MP 04 ZB 8190',
      rating: 4.8,
      current_lat: 23.3600,
      current_lon: 77.4300,
      capacity_kg: 1000,
      active_deliveries: 0
    },
    {
      id: 'driver_3',
      email: 'driver3@agrobridge.demo',
      name: 'Santosh Malviya',
      phone: '+91 98930 77889',
      vehicle_type: 'Mahindra Bolero Maxi',
      vehicle_number: 'MP 04 KH 3311',
      rating: 4.7,
      current_lat: 23.2800,
      current_lon: 77.4000,
      capacity_kg: 1200,
      active_deliveries: 2
    }
  ];

  const pickupLat = del.pickupLocation?.latitude || 23.4000;
  const pickupLon = del.pickupLocation?.longitude || 77.4300;

  const scored = candidateDrivers.map(d => {
    const distToFarm = haversineKm(d.current_lat, d.current_lon, pickupLat, pickupLon);
    const distanceScore = Math.max(0, 40 - (distToFarm * 2));
    const ratingScore = (d.rating / 5) * 30;
    const capacityScore = d.capacity_kg >= (del.payload_kg || 10) ? 20 : 5;
    const availabilityScore = Math.max(0, 10 - (d.active_deliveries * 5));
    const totalScore = Math.round(distanceScore + ratingScore + capacityScore + availabilityScore);
    return { ...d, distToFarm, totalScore };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  const best = scored[0];

  del.driver_id = best.email;
  del.driver_name = best.name;
  del.driver_phone = best.phone;
  del.vehicle_type = best.vehicle_type;
  del.vehicle_number = best.vehicle_number;
  del.status = 'driver_assigned';
  del.driverLocation = {
    latitude: best.current_lat,
    longitude: best.current_lon,
    updatedAt: new Date().toISOString()
  };
  del.current_gps = { lat: best.current_lat, lon: best.current_lon };

  const ord = orders.find(o => o.id === del.order_id);
  if (ord) ord.status = 'driver_assigned';

  return {
    delivery: del,
    driver: best,
    assigned_driver: {
      id: best.email,
      name: best.name,
      phone: best.phone,
      vehicle: best.vehicle_type,
      vehicle_type: best.vehicle_type,
      vehicle_number: best.vehicle_number,
      rating: best.rating
    },
    aiAlgorithm: 'AI-Assisted Driver Assignment (Proximity, Rating, Vehicle Capacity)',
    score: best.totalScore
  };
}

function getDeliveryTrackData(id) {
  let del = deliveries.find(d => d.id === id || d.order_id === id);
  let ord = orders.find(o => o.id === id || (del && o.id === del.order_id));

  if (!del && ord) {
    del = deliveries.find(d => d.order_id === ord.id);
  }

  // Fallback demo delivery object if not found
  if (!del) {
    return {
      deliveryId: id || 'DEL-4091',
      orderId: ord?.id || 'ORD-9102',
      deliveryStatus: 'OUT_FOR_DELIVERY',
      pickupLocation: {
        address: 'Patel Organic Farms, Berasia Road, Bhopal',
        latitude: 23.4000,
        longitude: 77.4300,
        lat: 23.4000,
        lon: 77.4300
      },
      deliveryLocation: {
        address: 'Flat 402, Green Meadows, Arera Colony, Bhopal',
        latitude: 23.2185,
        longitude: 77.4320,
        lat: 23.2185,
        lon: 77.4320
      },
      driverLocation: {
        latitude: 23.2800,
        longitude: 77.4100,
        lat: 23.2800,
        lon: 77.4100,
        updatedAt: new Date().toISOString()
      },
      estimatedDistance: 4.2,
      estimatedDistanceKm: 4.2,
      distance_km: 4.2,
      estimatedTime: 12,
      estimatedTimeMinutes: 12,
      eta_minutes: 12,
      driverInfo: {
        name: 'Ramesh Patel',
        phone: '+91 98264 44556',
        vehicleType: 'Pickup Truck (1.5 Ton)',
        vehicleNumber: 'MP 04 GA 4892',
        rating: 4.9,
        status: 'OUT_FOR_DELIVERY'
      },
      orderSummary: ord ? {
        id: ord.id,
        items: ord.items || [],
        totalAmount: ord.total_amount || 240,
        totalKg: ord.total_quantity_kg || 5
      } : {
        id: 'ORD-9102',
        items: [{ product_name: 'Organic Hybrid Tomatoes', quantity_kg: 5, price_per_kg: 28 }],
        totalAmount: 140,
        totalKg: 5
      }
    };
  }

  const pickupLat = del.pickupLocation?.latitude || del.pickupLocation?.lat || 23.4000;
  const pickupLon = del.pickupLocation?.longitude || del.pickupLocation?.lon || 77.4300;
  const deliveryLat = del.deliveryLocation?.latitude || del.deliveryLocation?.lat || 23.2185;
  const deliveryLon = del.deliveryLocation?.longitude || del.deliveryLocation?.lon || 77.4320;
  const driverLat = del.driverLocation?.latitude || del.driverLocation?.lat || del.current_gps?.lat || 23.2800;
  const driverLon = del.driverLocation?.longitude || del.driverLocation?.lon || del.current_gps?.lon || 77.4100;

  const distRemaining = haversineKm(driverLat, driverLon, deliveryLat, deliveryLon);
  const etaMins = Math.max(3, Math.round((distRemaining / 25) * 60));

  let normalizedStatus = 'ORDER_CONFIRMED';
  const raw = (del.status || '').toLowerCase();
  if (raw === 'searching_driver' || raw === 'pending' || raw === 'order_confirmed') normalizedStatus = 'ORDER_CONFIRMED';
  else if (raw === 'driver_assigned' || raw === 'assigned') normalizedStatus = 'DRIVER_ASSIGNED';
  else if (raw === 'picked_up') normalizedStatus = 'PICKED_UP';
  else if (raw === 'out_for_delivery') normalizedStatus = 'OUT_FOR_DELIVERY';
  else if (raw === 'delivered') normalizedStatus = 'DELIVERED';
  else normalizedStatus = 'OUT_FOR_DELIVERY';

  return {
    deliveryId: del.id,
    orderId: del.order_id,
    deliveryStatus: normalizedStatus,
    rawStatus: del.status,
    pickupLocation: {
      address: del.pickupLocation?.address || del.pickup_location || 'Patel Organic Farms, Berasia Road, Bhopal',
      latitude: pickupLat,
      longitude: pickupLon,
      lat: pickupLat,
      lon: pickupLon
    },
    deliveryLocation: {
      address: del.deliveryLocation?.address || del.dropoff_location || 'Flat 402, Green Meadows, Arera Colony, Bhopal',
      latitude: deliveryLat,
      longitude: deliveryLon,
      lat: deliveryLat,
      lon: deliveryLon
    },
    driverLocation: {
      latitude: driverLat,
      longitude: driverLon,
      lat: driverLat,
      lon: driverLon,
      updatedAt: del.driverLocation?.updatedAt || new Date().toISOString()
    },
    estimatedDistance: distRemaining,
    estimatedDistanceKm: distRemaining,
    distance_km: distRemaining,
    estimatedTime: etaMins,
    estimatedTimeMinutes: etaMins,
    eta_minutes: etaMins,
    driverInfo: {
      name: del.driver_name || 'Vikram Singh',
      phone: del.driver_phone || '+91 98264 44556',
      vehicleType: del.vehicle_type || 'Pickup Truck (1.5 Ton)',
      vehicleNumber: del.vehicle_number || 'MP 04 GA 4892',
      rating: 4.9,
      status: normalizedStatus
    },
    orderSummary: ord ? {
      id: ord.id,
      items: ord.items || [],
      totalAmount: ord.total_amount || 0,
      totalKg: ord.total_quantity_kg || 0,
      paymentMethod: ord.payment_method || 'Online Escrow',
      createdAt: ord.created_at
    } : null,
    pickupOtp: del.pickup_otp || '4891',
    deliveryOtp: del.delivery_otp || '7234'
  };
}

function processDemoPayment(paymentData) {
  const transactionId = `TXN-AGRO-${Date.now().toString().slice(-8)}`;
  return {
    status: 'SUCCESS',
    transactionId,
    amount: paymentData.amount || 0,
    paymentMethod: paymentData.paymentMethod || 'UPI',
    timestamp: new Date().toISOString(),
    escrowProtected: true,
    escrowStatus: 'HELD_IN_ESCROW'
  };
}

// -------------------------------------------------------------
// FEATURE 4: CONSUMER FEEDBACK & RATINGS FOR FARMER
// -------------------------------------------------------------
function addFeedback({ orderId, productId, consumerEmail, consumerName, ratings, review }) {
  // 1. Verify that order exists
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return { error: 'Order not found', code: 404 };
  }
  // 2. Verify order belongs to consumer
  if (order.buyer_id.toLowerCase() !== (consumerEmail || '').toLowerCase()) {
    return { error: 'Access denied: You can only review orders purchased by your account', code: 403 };
  }
  // 3. Verify order is delivered
  const orderStatus = (order.status || '').toLowerCase();
  if (orderStatus !== 'delivered') {
    return { error: 'Feedback can only be submitted after the order has been delivered', code: 400 };
  }
  // 4. Verify product is in order
  const orderItem = (order.items || []).find(i => (i.product_id === productId || i.id === productId));
  if (!orderItem) {
    return { error: 'Product not found in this delivered order', code: 400 };
  }

  // Get product & farmer details
  const prod = products.find(p => p.id === productId) || {};
  const farmerId = orderItem.farmer_id || prod.farmer_id || 'farmer@agrobridge.demo';
  const farmerName = orderItem.farm_name || prod.farmer_name || 'Ramesh Patel';

  const qRating = parseInt(ratings?.quality, 10) || 5;
  const fRating = parseInt(ratings?.freshness || ratings?.farmerExperience, 10) || 5;
  const pRating = parseInt(ratings?.packaging, 10) || 5;
  const aRating = parseInt(ratings?.valueForMoney || ratings?.accuracy, 10) || 5;
  const overall = Math.round(((qRating + fRating + pRating + aRating) / 4) * 100) / 100;

  const newFeedback = {
    id: `FB-${Math.floor(100 + Math.random() * 900)}`,
    orderId,
    order_id: orderId,
    productId,
    product_id: productId,
    productName: orderItem.product_name || prod.product_name || 'Farm Produce',
    product_name: orderItem.product_name || prod.product_name || 'Farm Produce',
    farmerId: farmerId,
    farmer_id: farmerId,
    farmerName: farmerName,
    farmer_name: farmerName,
    consumerId: consumerEmail,
    consumer_id: consumerEmail,
    consumerName: consumerName || order.buyer_name || 'Priya Sharma',
    consumer_name: consumerName || order.buyer_name || 'Priya Sharma',
    ratings: {
      quality: qRating,
      freshness: fRating,
      farmerExperience: fRating,
      packaging: pRating,
      valueForMoney: aRating,
      accuracy: aRating
    },
    overallScore: overall,
    overallRating: overall,
    comment: review || (ratings?.comment) || 'Great farm-fresh quality!',
    review: review || (ratings?.comment) || 'Great farm-fresh quality!',
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    verifiedPurchase: true
  };

  feedbacks.unshift(newFeedback);

  // Notify farmer
  notifications.unshift({
    id: `notif_${Date.now()}_fb`,
    recipient: farmerId,
    role: 'FARMER',
    title: `⭐ New Customer Review (${overall}★)`,
    message: `${newFeedback.consumer_name} rated your ${newFeedback.product_name} ${overall} stars: "${newFeedback.review.slice(0, 60)}..."`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, feedback: newFeedback };
}

function getFarmerFeedbacks(farmerId) {
  if (!farmerId) return feedbacks;
  return feedbacks.filter(f => 
    f.farmer_id === farmerId || 
    f.farmerId === farmerId || 
    farmerId === 'user_farmer_1' ||
    f.farmer_id === 'farmer@agrobridge.demo'
  );
}

function getProductFeedbacks(productId) {
  if (!productId) return feedbacks;
  return feedbacks.filter(f => f.product_id === productId || f.productId === productId);
}

function getAllFeedbacks() {
  return feedbacks;
}

// -------------------------------------------------------------
// FEATURE 5: CONSUMER COMPLAINT & SUPPORT DISPUTE RESOLUTION
// -------------------------------------------------------------
function createComplaint({ orderId, productId, consumerEmail, consumerName, issueCategory, reason, title, description, evidenceUrls, evidencePhotos }) {
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return { error: 'Order not found', code: 404 };
  }
  if (order.buyer_id && (order.buyer_id.toLowerCase() !== (consumerEmail || '').toLowerCase()) && consumerEmail !== 'consumer@agrobridge.demo') {
    return { error: 'Access denied: You can only file complaints for orders placed by your account', code: 403 };
  }

  const orderItem = (order.items || []).find(i => (i.product_id === productId || i.id === productId)) || order.items?.[0] || {};
  const prod = products.find(p => p.id === productId) || {};
  const farmerId = orderItem.farmer_id || prod.farmer_id || 'farmer@agrobridge.demo';
  const farmerName = orderItem.farm_name || prod.farmer_name || 'Ramesh Patel';
  const evList = Array.isArray(evidenceUrls) ? evidenceUrls : (Array.isArray(evidencePhotos) ? evidencePhotos : (evidenceUrls ? [evidenceUrls] : []));

  const newComplaint = {
    id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
    orderId: orderId,
    order_id: orderId,
    productId: productId || orderItem.product_id || 'prod_1',
    product_id: productId || orderItem.product_id || 'prod_1',
    productName: orderItem.product_name || prod.product_name || 'Farm Produce',
    product_name: orderItem.product_name || prod.product_name || 'Farm Produce',
    consumerId: consumerEmail,
    consumer_id: consumerEmail,
    consumerName: consumerName || order.buyer_name || 'Priya Sharma',
    consumer_name: consumerName || order.buyer_name || 'Priya Sharma',
    farmerId: farmerId,
    farmer_id: farmerId,
    farmerName: farmerName,
    farmer_name: farmerName,
    issueCategory: issueCategory || reason || 'QUALITY_ISSUE',
    issue_category: issueCategory || reason || 'QUALITY_ISSUE',
    reason: reason || title || 'Quality Issue',
    title: title || reason || 'Produce Issue Reported',
    description: description || 'Issue reported with received shipment.',
    evidencePhotos: evList,
    evidenceUrls: evList,
    evidence_urls: evList,
    status: 'SUBMITTED', // SUBMITTED -> UNDER_REVIEW -> IN_PROGRESS -> RESOLVED
    farmerResponse: null,
    farmer_response: null,
    farmerRespondedAt: null,
    farmer_responded_at: null,
    resolutionNotes: null,
    adminNotes: null,
    admin_notes: null,
    resolutionAction: null,
    resolution_action: null,
    resolvedAt: null,
    resolved_at: null,
    createdAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  complaints.unshift(newComplaint);

  // Notify farmer & admin
  notifications.unshift({
    id: `notif_${Date.now()}_cmp_f`,
    recipient: farmerId,
    role: 'FARMER',
    title: `⚠️ Consumer Dispute Filed (${newComplaint.id})`,
    message: `${newComplaint.consumer_name} reported an issue (${newComplaint.issue_category}) on ${newComplaint.product_name}. Please submit your response in Dashboard.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  notifications.unshift({
    id: `notif_${Date.now()}_cmp_a`,
    recipient: 'admin@agrobridge.demo',
    role: 'ADMIN',
    title: `🛡️ New Dispute Ticket: ${newComplaint.id}`,
    message: `Dispute filed by ${newComplaint.consumer_name} for order ${orderId}.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, complaint: newComplaint };
}

function getConsumerComplaints(consumerEmail) {
  if (!consumerEmail) return complaints;
  return complaints.filter(c => (c.consumer_id || c.consumerId || '').toLowerCase() === consumerEmail.toLowerCase());
}

function getFarmerComplaints(farmerEmail) {
  if (!farmerEmail) return complaints;
  const norm = normalizeFarmerId(farmerEmail);
  return complaints.filter(c => {
    const fId = normalizeFarmerId(c.farmer_id || c.farmerId);
    return fId === norm || (c.farmer_id || c.farmerId || '').toLowerCase() === farmerEmail.toLowerCase();
  });
}

function farmerRespondComplaint(complaintId, farmerEmail, responseText) {
  const cmp = complaints.find(c => c.id === complaintId);
  if (!cmp) return { error: 'Complaint not found', code: 404 };

  cmp.farmer_response = responseText;
  cmp.farmerResponse = responseText;
  cmp.farmer_responded_at = new Date().toISOString();
  cmp.farmerRespondedAt = cmp.farmer_responded_at;
  if (cmp.status === 'SUBMITTED') {
    cmp.status = 'UNDER_REVIEW';
  }
  cmp.updated_at = new Date().toISOString();
  cmp.updatedAt = cmp.updated_at;

  // Notify consumer
  notifications.unshift({
    id: `notif_${Date.now()}_cmp_resp`,
    recipient: cmp.consumer_id || cmp.consumerId,
    role: 'CONSUMER',
    title: `💬 Farmer Responded to Complaint ${cmp.id}`,
    message: `${cmp.farmer_name} responded to your dispute regarding ${cmp.product_name}.`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, complaint: cmp };
}

function getAllComplaints(filter = {}) {
  let list = [...complaints];
  if (filter.status && filter.status !== 'ALL') {
    list = list.filter(c => c.status.toUpperCase() === filter.status.toUpperCase());
  }
  return list;
}

function adminUpdateComplaint(complaintId, { status, adminNotes, resolutionNotes, resolutionAction }) {
  const cmp = complaints.find(c => c.id === complaintId);
  if (!cmp) return { error: 'Complaint not found', code: 404 };

  if (status) cmp.status = status;
  const notes = resolutionNotes !== undefined ? resolutionNotes : adminNotes;
  if (notes !== undefined) {
    cmp.admin_notes = notes;
    cmp.adminNotes = notes;
    cmp.resolutionNotes = notes;
    cmp.resolution_notes = notes;
  }
  if (resolutionAction !== undefined) {
    cmp.resolution_action = resolutionAction;
    cmp.resolutionAction = resolutionAction;
  }
  if (status === 'RESOLVED') {
    cmp.resolved_at = new Date().toISOString();
    cmp.resolvedAt = cmp.resolved_at;
  }
  cmp.updated_at = new Date().toISOString();
  cmp.updatedAt = cmp.updated_at;

  // Notify consumer
  notifications.unshift({
    id: `notif_${Date.now()}_cmp_res`,
    recipient: cmp.consumer_id,
    role: 'CONSUMER',
    title: `✅ Dispute ${cmp.id} Status Updated: ${cmp.status}`,
    message: `AgroBridge Admin updated your ticket. Status: ${cmp.status}. Notes: ${cmp.admin_notes || 'Resolved'}`,
    read: false,
    timestamp: new Date().toISOString()
  });

  return { success: true, complaint: cmp };
}

function adminReviewComplaint(complaintId, { decision, severity, adminNotes, adminUser } = {}) {
  const cmp = complaints.find(c => c.id === complaintId);
  if (!cmp) return { success: false, error: 'Complaint not found', code: 404 };

  const validDecisions = ['VALID', 'INVALID', 'NEED_MORE_INFO'];
  const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  if (decision && !validDecisions.includes(decision)) {
    return { success: false, error: `Invalid decision: ${decision}. Must be one of: ${validDecisions.join(', ')}`, code: 400 };
  }

  if (severity && !validSeverities.includes(severity)) {
    return { success: false, error: `Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`, code: 400 };
  }

  const now = new Date().toISOString();
  if (decision) {
    cmp.adminDecision = decision;
    cmp.admin_decision = decision;
    cmp.isVerified = decision === 'VALID';
    cmp.is_verified = decision === 'VALID';
  }
  if (severity) {
    cmp.severity = severity;
  }
  if (adminNotes !== undefined) {
    cmp.adminNotes = adminNotes;
    cmp.admin_notes = adminNotes;
  }

  cmp.reviewedAt = now;
  cmp.reviewed_at = now;
  cmp.reviewedBy = adminUser?.name || adminUser?.email || 'System Administrator';

  if (decision === 'VALID') {
    cmp.status = 'UNDER_REVIEW';
  } else if (decision === 'INVALID') {
    cmp.status = 'REJECTED';
  } else if (decision === 'NEED_MORE_INFO') {
    cmp.status = 'IN_PROGRESS';
  }

  cmp.updatedAt = now;
  cmp.updated_at = now;

  // Audit log
  logAdminAction({
    adminId: adminUser?.email || adminUser?.id || 'admin@agrobridge.demo',
    adminName: adminUser?.name || 'System Administrator',
    farmerId: cmp.farmer_id || cmp.farmerId,
    farmerName: cmp.farmer_name || cmp.farmerName,
    action: 'COMPLAINT_REVIEWED',
    reason: `Complaint ${cmp.id} evaluated as ${decision} with ${cmp.severity || 'MEDIUM'} severity`,
    relatedComplaintIds: [cmp.id],
    notes: adminNotes || `Admin decision: ${decision}`
  });

  // Notify farmer if valid or need more info
  const farmerEmail = getFarmerEmail(cmp.farmer_id || cmp.farmerId);
  if (decision === 'VALID') {
    notifications.unshift({
      id: `notif_${Date.now()}_cmp_valid`,
      recipient: farmerEmail,
      role: 'FARMER',
      type: 'COMPLAINT_VERIFIED',
      title: `⚠️ Verified Complaint Logged: ${cmp.id}`,
      message: `A quality complaint regarding ${cmp.product_name || 'produce'} was verified by AgroBridge administration (Severity: ${cmp.severity || 'MEDIUM'}). Please review quality controls.`,
      read: false,
      timestamp: now
    });
  }

  return { success: true, complaint: cmp };
}

function getFarmerComplaintSummary(farmerId) {
  const norm = normalizeFarmerId(farmerId);
  const farmerComplaints = complaints.filter(c => {
    const fId = normalizeFarmerId(c.farmer_id || c.farmerId);
    return fId === norm;
  });

  const totalComplaints = farmerComplaints.length;
  const verifiedComplaints = farmerComplaints.filter(c => c.isVerified === true || c.adminDecision === 'VALID');
  const invalidComplaints = farmerComplaints.filter(c => c.adminDecision === 'INVALID');
  const pendingReview = farmerComplaints.filter(c => !c.adminDecision || c.adminDecision === 'NEED_MORE_INFO');
  const highSeverityCount = verifiedComplaints.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL').length;
  const resolvedCount = farmerComplaints.filter(c => c.status === 'RESOLVED').length;

  return {
    totalComplaints,
    verifiedCount: verifiedComplaints.length,
    invalidCount: invalidComplaints.length,
    pendingReviewCount: pendingReview.length,
    highSeverityCount,
    resolvedCount,
    unresolvedCount: totalComplaints - resolvedCount,
    complaints: farmerComplaints,
    verifiedComplaints
  };
}

function calculateFarmerRiskInsight(farmerId) {
  const norm = normalizeFarmerId(farmerId);
  const summary = getFarmerComplaintSummary(norm);
  const farmerFeedbacks = getFarmerFeedbacks(norm);
  const farmerProducts = products.filter(p => normalizeFarmerId(p.farmer_id) === norm);
  
  // Total orders fulfilled by this farmer
  const farmerOrders = orders.filter(o => (o.items || []).some(i => normalizeFarmerId(i.farmer_id) === norm));
  const totalOrdersCount = farmerOrders.length;
  const deliveredOrdersCount = farmerOrders.filter(o => o.status === 'delivered').length;

  // Average Rating
  let avgRating = 4.8;
  if (farmerFeedbacks.length > 0) {
    const totalScore = farmerFeedbacks.reduce((sum, f) => sum + (parseFloat(f.overallRating || f.rating) || 5), 0);
    avgRating = Math.round((totalScore / farmerFeedbacks.length) * 10) / 10;
  }

  // Base risk score calculation
  let riskScore = 10; // Start at baseline low risk
  const riskFactors = [];

  // Verified complaints impact
  if (summary.verifiedCount === 1) {
    riskScore += 20;
    riskFactors.push('1 verified customer complaint on file');
  } else if (summary.verifiedCount === 2) {
    riskScore += 45;
    riskFactors.push('2 verified customer complaints on file (Warning threshold)');
  } else if (summary.verifiedCount >= 3) {
    riskScore += 65;
    riskFactors.push(`${summary.verifiedCount} verified complaints on record (Exceeds review threshold)`);
  }

  // High severity penalty
  if (summary.highSeverityCount > 0) {
    riskScore += summary.highSeverityCount * 15;
    riskFactors.push(`${summary.highSeverityCount} high-severity issue(s) detected`);
  }

  // Rating impact
  if (avgRating < 3.5) {
    riskScore += 25;
    riskFactors.push(`Low customer satisfaction rating (${avgRating}★ < 3.5★)`);
  } else if (avgRating < 4.2) {
    riskScore += 10;
    riskFactors.push(`Moderate customer rating (${avgRating}★)`);
  } else {
    riskFactors.push(`Strong customer rating (${avgRating}★)`);
  }

  // Order volume mitigating factor
  if (deliveredOrdersCount >= 10 && summary.verifiedCount <= 1) {
    riskScore = Math.max(5, riskScore - 15);
    riskFactors.push(`High order fulfillment consistency (${deliveredOrdersCount} orders delivered)`);
  }

  // Cap score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel = 'LOW RISK';
  let badgeColor = 'green';
  let recommendedAction = 'Maintain standard active status. Good delivery record and low dispute frequency.';

  if (riskScore >= 70) {
    riskLevel = 'HIGH RISK';
    badgeColor = 'red';
    recommendedAction = 'High risk profile. Review recent deliveries. Consider temporary unlisting or formal inspection.';
  } else if (riskScore >= 35) {
    riskLevel = 'MEDIUM RISK';
    badgeColor = 'yellow';
    recommendedAction = 'Moderate risk profile. Monitor incoming feedback. Consider sending an advisory warning if disputes persist.';
  }

  return {
    farmerId: norm,
    riskScore,
    riskLevel,
    badgeColor,
    riskFactors,
    recommendedAction,
    metrics: {
      totalComplaints: summary.totalComplaints,
      verifiedComplaints: summary.verifiedCount,
      pendingComplaints: summary.pendingReviewCount,
      highSeverityComplaints: summary.highSeverityCount,
      averageRating: avgRating,
      totalOrders: totalOrdersCount,
      deliveredOrders: deliveredOrdersCount,
      totalProducts: farmerProducts.length
    },
    aiLabel: 'AI-Assisted Risk Indicator',
    disclaimer: 'AI-assisted risk score is advisory only. Administrative actions must be based on verified human review.'
  };
}

function getAdminFarmersList() {
  const farmerProfiles = [
    {
      id: 'farmer_1',
      farmerId: 'farmer_1',
      email: 'farmer@agrobridge.demo',
      name: 'Ramesh Patel',
      farmName: 'Patel Organic Farms',
      location: 'Berasia Road, Bhopal, MP',
      district: 'Bhopal',
      phone: '+91 98765 43210',
      joinedDate: '2025-11-10'
    },
    {
      id: 'farmer_2',
      farmerId: 'farmer_2',
      email: 'anita@agrobridge.demo',
      name: 'Anita Bai',
      farmName: 'Anita Bai Organic Farms',
      location: 'Gulabganj, Vidisha, MP',
      district: 'Vidisha',
      phone: '+91 98261 22334',
      joinedDate: '2026-01-15'
    },
    {
      id: 'farmer_3',
      farmerId: 'farmer_3',
      email: 'mukesh@agrobridge.demo',
      name: 'Mukesh Yadav',
      farmName: 'Yadav Krishi Farm',
      location: 'Mandideep, Raisen, MP',
      district: 'Raisen',
      phone: '+91 98262 33445',
      joinedDate: '2026-02-01'
    },
    {
      id: 'farmer_4',
      farmerId: 'farmer_4',
      email: 'rajesh@agrobridge.demo',
      name: 'Rajesh Gurjar',
      farmName: 'Verma Co-operative Fields',
      location: 'Ichhawar, Sehore, MP',
      district: 'Sehore',
      phone: '+91 98263 44556',
      joinedDate: '2026-02-20'
    }
  ];

  return farmerProfiles.map(farmer => {
    const norm = normalizeFarmerId(farmer.id);
    const statusObj = getFarmerAccountStatus(norm);
    const complaintSummary = getFarmerComplaintSummary(norm);
    const riskInsight = calculateFarmerRiskInsight(norm);
    
    // Products
    const farmerProds = products.filter(p => normalizeFarmerId(p.farmer_id) === norm);
    
    // Orders
    const farmerOrders = orders.filter(o => (o.items || []).some(i => normalizeFarmerId(i.farmer_id) === norm));
    const farmerBulk = bulkOrders.filter(b => normalizeFarmerId(b.farmer_id) === norm);
    const totalOrdersCount = farmerOrders.length + farmerBulk.length;

    // Feedbacks
    const fbs = getFarmerFeedbacks(norm);
    let avgRating = 4.8;
    if (fbs.length > 0) {
      const sum = fbs.reduce((acc, f) => acc + (parseFloat(f.overallRating || f.rating) || 5), 0);
      avgRating = Math.round((sum / fbs.length) * 10) / 10;
    }

    return {
      ...farmer,
      accountStatus: statusObj.status,
      status: statusObj.status,
      statusReason: statusObj.statusReason,
      unlistedUntil: statusObj.unlistedUntil,
      statusUpdatedAt: statusObj.statusUpdatedAt,
      adminNotes: statusObj.adminNotes,
      totalProducts: farmerProds.length,
      totalOrders: totalOrdersCount,
      averageRating: avgRating,
      totalFeedbacks: fbs.length,
      totalComplaints: complaintSummary.totalComplaints,
      verifiedComplaints: complaintSummary.verifiedCount,
      pendingComplaints: complaintSummary.pendingReviewCount,
      riskInsight
    };
  });
}

function getAdminFarmerProfile(farmerId) {
  const norm = normalizeFarmerId(farmerId);
  const list = getAdminFarmersList();
  const farmer = list.find(f => normalizeFarmerId(f.id) === norm || normalizeFarmerId(f.email) === norm) || {
    id: norm,
    farmerId: norm,
    name: getFarmerName(norm),
    email: getFarmerEmail(norm),
    farmName: `${getFarmerName(norm)} Farm`,
    location: 'Madhya Pradesh, India',
    district: 'Bhopal',
    accountStatus: getFarmerAccountStatus(norm).status,
    status: getFarmerAccountStatus(norm).status,
    ...getFarmerAccountStatus(norm)
  };

  const farmerProds = products.filter(p => normalizeFarmerId(p.farmer_id) === norm);
  const farmerOrders = orders.filter(o => (o.items || []).some(i => normalizeFarmerId(i.farmer_id) === norm));
  const farmerBulk = bulkOrders.filter(b => normalizeFarmerId(b.farmer_id) === norm);
  const farmerFeedbacks = getFarmerFeedbacks(norm);
  const complaintSummary = getFarmerComplaintSummary(norm);
  const riskInsight = calculateFarmerRiskInsight(norm);
  const auditLogs = getAdminAuditLogs({ farmerId: norm });

  return {
    farmer,
    products: farmerProds,
    orders: farmerOrders,
    bulkOrders: farmerBulk,
    feedbacks: farmerFeedbacks,
    complaints: complaintSummary.complaints,
    complaintSummary,
    riskInsight,
    auditLogs
  };
}

function getComplaintAnalytics() {
  const totalComplaints = complaints.length;
  
  const categoryCounts = {};
  const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  const decisionCounts = { VALID: 0, INVALID: 0, NEED_MORE_INFO: 0, PENDING: 0 };
  let resolvedCount = 0;

  complaints.forEach(c => {
    // Categories
    const cat = c.issueCategory || c.issue_category || 'QUALITY_ISSUE';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Severity
    const sev = (c.severity || 'MEDIUM').toUpperCase();
    if (severityCounts[sev] !== undefined) {
      severityCounts[sev]++;
    } else {
      severityCounts.MEDIUM++;
    }

    // Decision
    const dec = c.adminDecision || c.admin_decision;
    if (dec && decisionCounts[dec] !== undefined) {
      decisionCounts[dec]++;
    } else {
      decisionCounts.PENDING++;
    }

    if (c.status === 'RESOLVED') resolvedCount++;
  });

  // Top farmers with verified complaints
  const farmerCounts = {};
  complaints.forEach(c => {
    if (c.isVerified === true || c.adminDecision === 'VALID') {
      const fId = normalizeFarmerId(c.farmer_id || c.farmerId);
      const fName = c.farmer_name || c.farmerName || getFarmerName(fId);
      farmerCounts[fId] = farmerCounts[fId] || { farmerId: fId, farmerName: fName, count: 0 };
      farmerCounts[fId].count++;
    }
  });

  const topComplaintFarmers = Object.values(farmerCounts).sort((a, b) => b.count - a.count);

  return {
    totalComplaints,
    verifiedComplaints: decisionCounts.VALID,
    resolvedCount,
    resolutionRate: totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 100,
    byCategory: categoryCounts,
    bySeverity: severityCounts,
    byDecision: decisionCounts,
    topComplaintFarmers
  };
}

// -------------------------------------------------------------
// FEATURE 1: MULTI-HORIZON FUTURE MARKET & DEMAND FORECASTING
// -------------------------------------------------------------
function generateFutureInsights({ commodity = 'Tomato', period = '7d', role = 'FARMER' } = {}) {
  const COMMODITY_PROFILES = {
    'Tomato': { basePrice: 28, baseDemand: 1800, unit: 'kg', trend: '+14% Rising', volatility: 'Moderate', harvestLag: '3 days' },
    'Wheat': { basePrice: 38, baseDemand: 4500, unit: 'kg', trend: '+18% Strong', volatility: 'Low', harvestLag: '7 days' },
    'Onion': { basePrice: 26, baseDemand: 2400, unit: 'kg', trend: '+8% Steady', volatility: 'High', harvestLag: '5 days' },
    'Potato': { basePrice: 22, baseDemand: 3100, unit: 'kg', trend: '+5% Stable', volatility: 'Low', harvestLag: '10 days' },
    'Cucumber': { basePrice: 25, baseDemand: 1200, unit: 'kg', trend: '+12% Upward', volatility: 'Moderate', harvestLag: '2 days' },
    'Spinach': { basePrice: 32, baseDemand: 850, unit: 'kg', trend: '+22% Surging', volatility: 'High', harvestLag: '1 day' },
    'Soybean': { basePrice: 46, baseDemand: 3200, unit: 'kg', trend: '+16% High', volatility: 'Low', harvestLag: '14 days' },
    'Apple': { basePrice: 110, baseDemand: 1400, unit: 'kg', trend: '+15% Premium', volatility: 'Low', harvestLag: '7 days' },
    'Banana': { basePrice: 36, baseDemand: 1900, unit: 'kg', trend: '+4% Consistent', volatility: 'Low', harvestLag: '4 days' },
    'Rice': { basePrice: 85, baseDemand: 2800, unit: 'kg', trend: '+10% Steady', volatility: 'Low', harvestLag: '30 days' },
    'Milk': { basePrice: 65, baseDemand: 1200, unit: 'Ltr', trend: '+6% Steady', volatility: 'Low', harvestLag: 'Daily' },
    'Dal': { basePrice: 135, baseDemand: 1600, unit: 'kg', trend: '+11% Upward', volatility: 'Low', harvestLag: '15 days' },
    'Carrot': { basePrice: 34, baseDemand: 1100, unit: 'kg', trend: '+9% Steady', volatility: 'Moderate', harvestLag: '3 days' },
    'Mango': { basePrice: 180, baseDemand: 950, unit: 'kg', trend: '+25% Peak', volatility: 'High', harvestLag: '2 days' }
  };

  const key = Object.keys(COMMODITY_PROFILES).find(k => commodity.toLowerCase().includes(k.toLowerCase())) || 'Tomato';
  const profile = COMMODITY_PROFILES[key];

  let points = [];
  const now = new Date();

  if (period === '7d') {
    // 3 past days + today (boundary) + 7 future forecast days
    const pastOffsets = [-3, -2, -1, 0];
    const futureOffsets = [1, 2, 3, 4, 5, 6, 7];

    pastOffsets.forEach(offset => {
      const d = new Date(now.getTime() + offset * 86400000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayFactor = 1 + (offset * 0.02) + (Math.sin(offset) * 0.03);
      const demandVal = Math.round(profile.baseDemand * dayFactor);
      const priceVal = Math.round(profile.basePrice * (1 + offset * 0.01) * 10) / 10;
      const isBoundary = (offset === 0);

      points.push({
        date: isBoundary ? `${label} (Today)` : label,
        demand: demandVal,
        forecastDemand: isBoundary ? demandVal : null,
        price: priceVal,
        forecastPrice: isBoundary ? priceVal : null,
        confidencePct: 98,
        isForecast: false,
        isBoundary
      });
    });

    futureOffsets.forEach((offset, idx) => {
      const d = new Date(now.getTime() + offset * 86400000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const futureFactor = 1 + (offset * 0.03) + (idx === 1 ? 0.05 : 0.02);
      const fDemandVal = Math.round(profile.baseDemand * futureFactor);
      const fPriceVal = Math.round((profile.basePrice * (1 + offset * 0.02)) * 10) / 10;
      const conf = Math.max(80, 94 - offset * 2);

      points.push({
        date: `${label} (Proj)`,
        demand: null,
        forecastDemand: fDemandVal,
        price: null,
        forecastPrice: fPriceVal,
        confidencePct: conf,
        isForecast: true,
        isBoundary: false
      });
    });
  } else if (period === '30d') {
    // 4 past weeks + current boundary + 4 forecast weeks
    for (let w = -4; w <= 0; w++) {
      const label = w === 0 ? 'Current Wk' : `Wk ${w + 5}`;
      const factor = 1 + (w * 0.03);
      const demandVal = Math.round(profile.baseDemand * 6.5 * factor);
      const priceVal = Math.round((profile.basePrice * (1 + w * 0.015)) * 10) / 10;
      const isBoundary = (w === 0);

      points.push({
        date: label,
        demand: demandVal,
        forecastDemand: isBoundary ? demandVal : null,
        price: priceVal,
        forecastPrice: isBoundary ? priceVal : null,
        confidencePct: 96,
        isForecast: false,
        isBoundary
      });
    }

    for (let w = 1; w <= 4; w++) {
      const label = `Wk +${w} (Proj)`;
      const factor = 1 + (w * 0.05);
      const fDemandVal = Math.round(profile.baseDemand * 6.5 * factor);
      const fPriceVal = Math.round((profile.basePrice * (1 + w * 0.03)) * 10) / 10;
      const conf = Math.max(78, 92 - w * 3);

      points.push({
        date: label,
        demand: null,
        forecastDemand: fDemandVal,
        price: null,
        forecastPrice: fPriceVal,
        confidencePct: conf,
        isForecast: true,
        isBoundary: false
      });
    }
  } else {
    // 3 Months horizon (12 projection weeks)
    for (let w = -4; w <= 0; w++) {
      const label = w === 0 ? 'Current Wk' : `Past Wk ${w + 5}`;
      const demandVal = Math.round(profile.baseDemand * 7 * (1 + w * 0.02));
      const priceVal = Math.round((profile.basePrice * (1 + w * 0.01)) * 10) / 10;
      const isBoundary = (w === 0);

      points.push({
        date: label,
        demand: demandVal,
        forecastDemand: isBoundary ? demandVal : null,
        price: priceVal,
        forecastPrice: isBoundary ? priceVal : null,
        confidencePct: 95,
        isForecast: false,
        isBoundary
      });
    }

    for (let w = 1; w <= 12; w++) {
      const label = `Wk +${w} (Proj)`;
      const fDemandVal = Math.round(profile.baseDemand * 7 * (1 + w * 0.025));
      const fPriceVal = Math.round((profile.basePrice * (1 + w * 0.015)) * 10) / 10;
      const conf = Math.max(70, 92 - Math.floor(w * 1.5));

      points.push({
        date: label,
        demand: null,
        forecastDemand: fDemandVal,
        price: null,
        forecastPrice: fPriceVal,
        confidencePct: conf,
        isForecast: true,
        isBoundary: false
      });
    }
  }

  const projectedDemandTotal = points
    .map(p => p.demand || p.forecastDemand || 0)
    .reduce((a, b) => a + b, 0);

  const avgPrice = Math.round(
    points.reduce((acc, p) => acc + (p.price || p.forecastPrice || 0), 0) / points.length * 10
  ) / 10;

  const historyPoints = points.filter(p => !p.isForecast);
  const forecastPoints = points.filter(p => p.isForecast);

  return {
    commodity: key,
    unit: profile.unit,
    period,
    trend: profile.trend,
    volatility: profile.volatility,
    harvestLag: profile.harvestLag,
    confidenceScore: 0.92,
    confidencePercentage: 92.4,
    points,
    history: historyPoints,
    forecast: forecastPoints,
    summary: {
      trendDirection: profile.trend,
      confidenceScore: 0.92,
      confidencePercentage: 92.4
    },
    currentMarketPrice: profile.basePrice,
    projectedDemandTotal,
    averagePriceOverPeriod: avgPrice,
    farmerAdvisory: `Projected high institutional & household demand for ${key}. List fresh harvests early on AgroBridge to lock in direct-to-consumer premiums (+20-25% over Mandi).`,
    consumerAdvisory: `Seasonal availability of ${key} is projected to remain steady. Buying direct from verified farmers saves an estimated 20-35% compared to supermarket markups.`,
    isAiAssisted: true,
    disclaimer: 'AI-assisted forecast based on available regional market trends and demo historical data. Actual mandi and retail prices may vary.'
  };
}

module.exports = {
  products,
  orders,
  deliveries,
  rfqs,
  notifications,
  feedbacks,
  complaints,
  CATEGORY_FALLBACK_IMAGES,
  getProducts,
  getProductById,
  addProduct,
  addProductImage,
  setPrimaryImage,
  removeProductImage,
  verifyProductQuality,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrderById,
  getOrders,
  getDeliveries,
  getDeliveryById,
  getDeliveryTrackData,
  acceptDelivery,
  verifyPickup,
  verifyDelivery,
  updateDeliveryStatus,
  updateDriverLocation,
  assignSmartDriver,
  processDemoPayment,
  addFeedback,
  getFarmerFeedbacks,
  getProductFeedbacks,
  getAllFeedbacks,
  createComplaint,
  getConsumerComplaints,
  getFarmerComplaints,
  farmerRespondComplaint,
  getAllComplaints,
  adminUpdateComplaint,
  generateFutureInsights,
  addRFQ,
  getRFQs,
  getNotifications,
  calculatePriceRecommendation,
  predictDemand,
  optimizeRoute,
  getProductPriceComparison,
  getProductPriceHistory,
  createPriceAlert: marketPriceService.createPriceAlert,
  getPriceAlerts: marketPriceService.getPriceAlertsForUser,
  getBestPricesNearYou,
  bulkOrders,
  bulkFeedbacks,
  createBulkOrder,
  getBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
  calculateAIBestDeal,
  createBulkFeedback,
  getFarmerBulkFeedback,
  markNotificationRead,
  // Admin Farmer Management & Complaints System
  farmerAccountStatuses,
  adminActions,
  normalizeFarmerId,
  getFarmerAccountStatus,
  isFarmerEligibleForMarketplace,
  logAdminAction,
  getAdminAuditLogs,
  updateFarmerAccountStatus,
  restoreFarmerStatus,
  adminReviewComplaint,
  getFarmerComplaintSummary,
  calculateFarmerRiskInsight,
  getAdminFarmersList,
  getAdminFarmerProfile,
  getComplaintAnalytics
};
