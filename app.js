// 1. Initialize Map
const map = L.map("map").setView([12.8797, 121.774], 6);

// 2. Map province names to categories
const historyMap = {
  human: ["Cagayan", "Kalinga", "Palawan", "Occidental Mindoro"],
  austro: ["Batanes", "Cagayan", "Ilocos Norte"],
  trade: [
    "Metropolitan Manila",
    "Cebu",
    "Sulu",
    "Agusan del Norte",
    "Iloilo",
    "Pangasinan",
  ],
  indic: ["Laguna", "Agusan del Sur", "Cebu", "Davao del Norte"],
  islam: ["Sulu", "Tawi-Tawi", "Maguindanao", "Lanao del Sur", "Basilan"],
  china: ["Occidental Mindoro", "Batangas", "Zambales", "Palawan"],
};

const catColors = {
  human: "#e63946",
  austro: "#457b9d",
  trade: "#f1c40f",
  indic: "#9b59b6",
  islam: "#2ecc71",
  china: "#34495e",
  default: "#eeeeee",
};

// 3. Historical Data Dictionary
const legendData = {
  human: {
    title: "Early Human Settlements",
    desc: "The Philippines possesses a deep human history stretching back hundreds of thousands of years. Groundbreaking discoveries in sites like Rizal, Kalinga have unearthed stone tools and butchered rhinoceros bones dating back 709,000 years. Furthermore, Callao Cave in Cagayan yielded the remains of Homo luzonensis, a unique hominin species that lived at least 67,000 years ago.",
    sig: "These findings prove that ancient hominins successfully reached the archipelago via seafaring or land bridges long before anatomically modern humans arrived.",
    visual: `<img src="images/early-settlement.png">`,
    source: "Pawlik, A., & Fuentes, R. (2023). Prehistoric hunter-gatherers in the Philippines—Subsistence strategies, adaptation, and behaviour in maritime environments",
  },
  austro: {
    title: "Austronesian Migration Route",
    desc: "Around 2500–2000 BCE, maritime agriculturalists from Taiwan migrated southward into the Batanes Islands and Northern Luzon. They brought advanced seafaring technology (outrigger canoes), agriculture (rice and taro), and the Malayo-Polynesian language family. This migration eventually populated vast territories across the Pacific and Indian Oceans.",
    sig: "This era forms the genetic, linguistic, and cultural bedrock of modern Filipino identity, establishing early agricultural society.",
    visual: "",
    source: "Peter Bellwood (2005), The First Farmers",
  },
  trade: {
    title: "Precolonial Trade Ports",
    desc: "Prior to Spanish colonization, coastal 'Thalassocracies' (sea-based states) flourished, operating as international trade hubs. Polities like Butuan, Tondo, and Cebu exported gold, beeswax, and pearls. The discovery of massive Balangay plank boats in Butuan demonstrates highly sophisticated maritime engineering and extensive regional commerce.",
    sig: "Demonstrates that precolonial Filipinos were globally connected merchants with complex political structures governed by Datus and Rajahs.",
    visual: "",
    source: "William Henry Scott (1994)",
  },
  indic: {
    title: "Indic Culture Influence",
    desc: "Integration with the Srivijaya and Majapahit empires introduced Indic cultural elements to the islands. The Laguna Copperplate Inscription (900 CE), the oldest written document found in the Philippines, uses a Brahmic script (Kawi) and Old Malay heavily infused with Sanskrit. Religious artifacts like the Golden Tara highlight the adoption of Hindu-Buddhist iconography.",
    sig: "Permanently influenced Philippine language, script (Baybayin), and art, linking the islands to the broader 'Indianized' sphere of Southeast Asia.",
    visual: "",
    source: "Antoon Postma (1992); Juan R. Francisco (1964)",
  },
  islam: {
    title: "Early Islamic Center",
    desc: "In the late 14th century, Arab and Malay missionaries introduced Islam to the southern archipelago. The Sheikh Karimul Makhdum Mosque in Tawi-Tawi, built in 1380, is recognized as the country's first mosque. This religious movement led to the formation of the highly organized Sultanates of Sulu and Maguindanao.",
    sig: "Introduced the first centralized, monotheistic state systems and sophisticated maritime legal codes in the Philippine islands.",
    visual: "",
    source: "Cesar Adib Majul (1973), Muslims in the Philippines",
  },
  china: {
    title: "Chinese Trade Relations",
    desc: "The Philippine archipelago was a vital node in the ancient Maritime Silk Road. Chinese Song Dynasty records from 1225 CE explicitly document trade with 'Ma-i' (Mindoro). Widespread archaeological findings, including the Pandanan shipwreck, have yielded tens of thousands of Ming and Yuan dynasty porcelain pieces traded for local goods.",
    sig: "Created a centuries-long economic link that permanently shaped local pottery, metallurgy, cuisine, and social hierarchies.",
    visual: "",
    source: "Chau Ju-Kua (1225), Chu-fan-chi; National Museum",
  },
};

let geojsonLayer;
let currentActiveCategory = null;

// --- Helper Functions for Info Panel ---

function showInfoPanel(cat) {
  if (!cat || !legendData[cat]) return;

  if (currentActiveCategory === cat) return;
  currentActiveCategory = cat;

  const data = legendData[cat];
  document.getElementById("info-title").innerText = data.title;
  document.getElementById("info-desc").innerText = data.desc;
  document.getElementById("info-sig").innerText = data.sig;
  document.getElementById("info-visual").innerHTML = data.visual;
  document.getElementById("info-source").innerText = data.source;
  document.getElementById("dynamic-info-panel").style.display = "block";
}

// Find categories associated with a province
function getProvinceCategories(provName) {
  let matched = [];
  for (let cat in historyMap) {
    if (historyMap[cat].includes(provName)) matched.push(cat);
  }
  return matched;
}

// 4. Fetch and Load Provinces.json
fetch("Provinces.json")
  .then((res) => res.json())
  .then((data) => {
    geojsonLayer = L.geoJSON(data, {
      style: (feature) => ({
        fillColor: catColors.default,
        weight: 1,
        opacity: 1,
        color: "#cccccc",
        fillOpacity: 1,
      }),
      onEachFeature: (feature, layer) => {
        const provName =
          feature.properties.PROVINCE || feature.properties.NAME_1;
        layer.bindPopup(
          `<strong>${provName}</strong><br><small>${feature.properties.REGION}</small>`,
        );

        layer.on({
          mouseover: (e) => {
            const cats = getProvinceCategories(provName);
            if (cats.length > 0) {
              const primaryCat = cats[0];
              showInfoPanel(primaryCat);

              layer.setStyle({
                fillColor: catColors[primaryCat],
                fillOpacity: 1,
                weight: 2.5,
                color: "#333",
              });
              layer.bringToFront();
            }
          },
          mouseout: (e) => {
            geojsonLayer.resetStyle(e.target);
          },
          click: (e) => {
            const cats = getProvinceCategories(provName);
            if (cats.length > 0) showInfoPanel(cats[0]);
          },
        });
      },
    }).addTo(map);
  });

// 5. Legend Hover Logic
document.querySelectorAll(".legend-item").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    const cat = item.getAttribute("data-category");
    showInfoPanel(cat);

    geojsonLayer.eachLayer((layer) => {
      const pName =
        layer.feature.properties.PROVINCE || layer.feature.properties.NAME_1;
      if (historyMap[cat].includes(pName)) {
        layer.setStyle({
          fillColor: catColors[cat],
          fillOpacity: 1,
          weight: 2,
          color: "#333",
        });
        layer.bringToFront();
      } else {
        layer.setStyle({ fillOpacity: 0.3, weight: 0.5 });
      }
    });
  });

  item.addEventListener("mouseleave", () => {
    geojsonLayer.eachLayer((layer) => geojsonLayer.resetStyle(layer));
  });
});
