const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Food = require('../models/Food');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');

const defaultFoodItems = [
  {
    _id: "food_cam_1",
    name: "Ndolé avec Plantains",
    description: "Le plat national du Cameroun. Feuilles de ndolé amères mijotées avec des arachides grillées, des crevettes fumées et de la viande, servies avec des plantains mûrs frits à la perfection.",
    price: 3000,
    category: "Plats Traditionnels",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?auto=format&fit=crop&q=80&w=800",
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
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
    ingredients: "Patate Douce, Farine, Oeufs, Lait, Muscade, Cannelle, Sucre",
    sourcing: "Ingrédients locaux de Bamenda",
    prepTime: "20 mins"
  }
];

async function initializeDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI is not defined in the environment variables!");
    console.error("The server will start but database operations will fail.");
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to MongoDB Atlas successfully.");

    // Seed Admin User from environment variables
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminName     = process.env.ADMIN_NAME;
      const adminEmail    = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminName || !adminEmail || !adminPassword) {
        console.warn(
          "[SEED] ADMIN_NAME, ADMIN_EMAIL or ADMIN_PASSWORD env vars are not set. " +
          "Skipping admin user seed. Set them in your environment and restart."
        );
      } else {
        const salt           = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await User.create({
          name: adminName,
          email: adminEmail.toLowerCase(),
          password: hashedPassword,
          cartData: {},
          isAdmin: true
        });
        console.log(`[SEED] Admin user seeded: ${adminEmail}`);
      }
    }

    // Seed Food Items
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      await Food.create(defaultFoodItems);
      console.log("Seeded default food items.");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB or seeding data:", error.message);
    console.error("The server will continue running. Database operations may fail until connection is restored.");
  }
}

// Temporary backward compatibility shim
function readDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Backward compatibility read failed:", e);
  }
  return { users: [], foods: [], orders: [], testimonials: [] };
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Backward compatibility write failed:", e);
    return false;
  }
}

module.exports = {
  initializeDB,
  readDB,
  writeDB
};
