const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');

// Ensure database directory and file exist
function initializeDB() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const defaultFoodItems = [
    {
      _id: "food_cam_1",
      name: "Ndolé avec Plantains",
      description: "Le plat national du Cameroun. Feuilles de ndolé amères mijotées avec des arachides grillées, des crevettes fumées et de la viande, servies avec des plantains mûrs frits à la perfection.",
      price: 3000,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800",
      ingredients: "Feuilles de Ndolé, Arachides, Crevettes Fumées, Viande de Boeuf, Plantains",
      sourcing: "Marchés locaux de Bamenda",
      prepTime: "30 mins"
    },
    {
      _id: "food_cam_2",
      name: "Poulet DG",
      description: "Le prestigieux 'Directeur Général' — poulet de ferme sauté avec des légumes frais, des plantains mûrs et des épices camerounaises. Un festin pour les grandes occasions.",
      price: 4500,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800",
      ingredients: "Poulet de Ferme, Plantains, Poivrons, Tomates, Épices Camerounaises",
      sourcing: "Élevages locaux de Bamenda",
      prepTime: "35 mins"
    },
    {
      _id: "food_cam_3",
      name: "Eru et Waterfu-fu",
      description: "Feuilles d'eru finement hachées cuites avec des cossettes et de l'huile de palme rouge, accompagnées d'un fufu de manioc blanc et moelleux. Authentique recette du Sud-Ouest.",
      price: 2500,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
      ingredients: "Feuilles d'Eru, Cossettes, Huile de Palme, Viande de Fumée, Water Fufu",
      sourcing: "Fournisseurs du Sud-Ouest Cameroun",
      prepTime: "40 mins"
    },
    {
      _id: "food_cam_4",
      name: "Achu Soup (Soupe Jaune)",
      description: "Soupe jaune épicée préparée avec du taro pilé, de l'huile de palme purifiée (ohuile), des feuilles fraîches et des épices secrètes. Plat emblématique des Grassfields.",
      price: 3000,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=800",
      ingredients: "Taro, Huile de Palme Purifiée, Viande, Épices Traditionnelles, Légumes",
      sourcing: "Marchés des Grassfields, Bamenda",
      prepTime: "45 mins"
    },
    {
      _id: "food_cam_5",
      name: "Poisson Braisé (Maquereau)",
      description: "Maquereau frais mariné dans un mélange d'épices camerounaises, braisé au charbon de bois jusqu'à la perfection, servi avec du bobolo (manioc fermenté) et de la sauce pimentée.",
      price: 3500,
      category: "Poissons & Grillades",
      image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800",
      ingredients: "Maquereau Frais, Épices Camerounaises, Bobolo, Sauce Pimentée, Oignons",
      sourcing: "Fournisseurs de poissons frais de Bamenda",
      prepTime: "25 mins"
    },
    {
      _id: "food_cam_6",
      name: "Soya (Brochettes de Boeuf)",
      description: "Brochettes de boeuf tendres marinées dans un mélange secret d'épices camerounaises — suya pepper, gingembre et ail — grillées à la flamme vive. La street food incontournable de Bamenda.",
      price: 1500,
      category: "Poissons & Grillades",
      image: "https://images.unsplash.com/photo-1540713434306-53f2485e493b?auto=format&fit=crop&q=80&w=800",
      ingredients: "Boeuf, Suya Pepper, Gingembre, Ail, Oignons Grillés",
      sourcing: "Bouchers locaux de Bamenda",
      prepTime: "15 mins"
    },
    {
      _id: "food_cam_7",
      name: "Kati Kati et Fufu Corn",
      description: "Poulet de ferme découpé et mijoté longuement dans sa propre graisse avec des épices locales, servi avec du fufu de maïs traditionnel et des légumes verts de saison.",
      price: 2500,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
      ingredients: "Poulet de Ferme, Fufu de Maïs, Légumes Verts, Épices Locales",
      sourcing: "Élevages de la région du Nord-Ouest",
      prepTime: "40 mins"
    },
    {
      _id: "food_cam_8",
      name: "Kwacoco Bible",
      description: "Cocoyam râpé mélangé avec de l'huile de palme, des crevettes fumées et des épices, enveloppé dans des feuilles de bananier et cuit à la vapeur. Délice typique du Littoral.",
      price: 2000,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800",
      ingredients: "Cocoyam, Huile de Palme, Crevettes Fumées, Feuilles de Bananier, Épices",
      sourcing: "Fournisseurs du Littoral",
      prepTime: "50 mins"
    },
    {
      _id: "food_cam_9",
      name: "Jus de Ditax",
      description: "Boisson naturelle faite à partir de fruits de ditax frais, légèrement sucrée, fraîche et rafraîchissante. La limonade camerounaise pour accompagner vos repas.",
      price: 800,
      category: "Boissons",
      image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&q=80&w=800",
      ingredients: "Fruit de Ditax, Eau, Sucre de Canne",
      sourcing: "Fruits locaux de Bamenda",
      prepTime: "5 mins"
    },
    {
      _id: "food_cam_10",
      name: "Porc au Four avec Miondo",
      description: "Porc tendre mariné pendant 12 heures dans des épices camerounaises, rôti lentement au four, servi avec du miondo (bâtons de manioc) et une sauce pimentée maison.",
      price: 4000,
      category: "Poissons & Grillades",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
      ingredients: "Porc, Épices Camerounaises, Miondo, Sauce Pimentée Maison",
      sourcing: "Éleveurs locaux de Bamenda",
      prepTime: "55 mins"
    },
    {
      _id: "food_cam_11",
      name: "Okok (Gnetum) au Poisson",
      description: "Feuilles d'okok finement hachées mijotées avec du poisson fumé, de l'huile de palme et des arachides moulues. Un plat délicat et nutritif du Centre-Sud Cameroun.",
      price: 2800,
      category: "Plats Traditionnels",
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
      ingredients: "Feuilles d'Okok, Poisson Fumé, Huile de Palme, Arachides, Épices",
      sourcing: "Marché Central de Bamenda",
      prepTime: "35 mins"
    },
    {
      _id: "food_cam_12",
      name: "Cake de Patate Douce",
      description: "Gâteau moelleux à base de patate douce violette, parfumé à la noix de muscade et à la cannelle, légèrement sucré. Le dessert maison réconfortant de Joel's Kitchen.",
      price: 1200,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800",
      ingredients: "Patate Douce, Farine, Oeufs, Lait, Muscade, Cannelle, Sucre",
      sourcing: "Ingrédients locaux de Bamenda",
      prepTime: "20 mins"
    }
  ];

  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [
        // default admin user for initial testing
        {
          _id: "admin_user_01",
          name: "AMOH JOEL",
          email: "joelamoh65@gmail.com",
          password: "$2a$10$tiY2X0XwVT4ANsQF4axUAuEFAQrczXKmNEfUQymnmHPDlcYzyL7c.", // "admin123" salt-hashed
          cartData: {},
          isAdmin: true
        }
      ],
      foods: defaultFoodItems,
      orders: [],
      testimonials: [],
      cateringInquiries: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log("Database initialized with seed data at " + dbPath);
  } else {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      let shouldWrite = false;
      const isOldData = parsed.foods && parsed.foods.length > 0 && (!parsed.foods[0]._id || !parsed.foods[0]._id.startsWith('food_cam_'));
      if (!parsed.foods || parsed.foods.length === 0 || isOldData) {
        parsed.foods = defaultFoodItems;
        shouldWrite = true;
        console.log("Forcing update to Cameroonian food catalog in existing db.json.");
      }
      if (!parsed.testimonials) {
        parsed.testimonials = [];
        shouldWrite = true;
      }
      if (!parsed.cateringInquiries) {
        parsed.cateringInquiries = [];
        shouldWrite = true;
      }
      if (shouldWrite) {
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    } catch (e) {
      console.error("DB initialization check failed, resetting to defaults", e);
    }
  }
}

function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return { users: [], foods: [], orders: [], testimonials: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error writing to database:", error);
    return false;
  }
}

module.exports = {
  initializeDB,
  readDB,
  writeDB
};
