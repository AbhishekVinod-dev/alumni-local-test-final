// // import express from "express";
// // import { initializeApp, cert } from "firebase-admin/app";
// // import { getFirestore } from "firebase-admin/firestore";
// // import OpenAI from "openai";

// // const app = express();
// // app.use(express.json());

// // // 🔹 Firebase setup with service account
// // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// // initializeApp({ credential: cert(serviceAccount) });
// // const db = getFirestore();

// // // 🔹 OpenAI setup
// // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // app.post("/api/chatbot", async (req, res) => {
// //   try {
// //     const { message } = req.body;

// //     // Fetch Firestore data
// //     const eventsSnap = await db.collection("events").get();
// //     const fundraisingSnap = await db.collection("fundraising").get();
// //     const internshipsSnap = await db.collection("internships").get();

// //     const events = eventsSnap.docs.map((d) => d.data());
// //     const fundraising = fundraisingSnap.docs.map((d) => d.data());
// //     const internships = internshipsSnap.docs.map((d) => d.data());

// //     // Build context for AI
// //     let context = "Here is the alumni platform data:\n\n";
// //     if (events.length) context += "Events:\n" + events.map(e => `- ${e.title} on ${e.date}`).join("\n") + "\n\n";
// //     if (fundraising.length) context += "Fundraising:\n" + fundraising.map(f => `- ${f.campaignName}: ${f.amountRaised}/${f.goal}`).join("\n") + "\n\n";
// //     if (internships.length) context += "Internships:\n" + internships.map(i => `- ${i.title} at ${i.company}`).join("\n") + "\n\n";

// //     // Ask OpenAI
// //     const completion = await openai.chat.completions.create({
// //       model: "gpt-3.5-turbo",
// //       messages: [
// //         { role: "system", content: "You are the AI Alumni Assistant. Use only the provided Firestore data." },
// //         { role: "system", content: context },
// //         { role: "user", content: message }
// //       ]
// //     });

// //     const reply = completion.choices[0].message.content;
// //     res.json({ reply });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Chatbot error" });
// //   }
// // });

// // export default app;
// import { initializeApp, cert } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import OpenAI from "openai";
// import cors from "cors";
// app.use(cors());


// // 🔹 Firebase setup
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// initializeApp({
//   credential: cert(serviceAccount)
// });
// const db = getFirestore();

// // 🔹 OpenAI setup
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const { message } = req.body;

//     // 🔹 Fetch Firestore data
//     const eventsSnap = await db.collection("events").get();
//     const fundraisingSnap = await db.collection("fundraising").get();
//     const internshipsSnap = await db.collection("internships").get();

//     const events = eventsSnap.docs.map(d => d.data());
//     const fundraising = fundraisingSnap.docs.map(d => d.data());
//     const internships = internshipsSnap.docs.map(d => d.data());

//     // 🔹 Build context for AI
//     let context = "Here is the alumni platform data:\n\n";

//     if (events.length) {
//       context += "Events:\n" + events.map(e => `- ${e.title} on ${e.date}`).join("\n") + "\n\n";
//     }
//     if (fundraising.length) {
//       context += "Fundraising:\n" + fundraising.map(f => `- ${f.campaignName}: ${f.amountRaised}/${f.goal}`).join("\n") + "\n\n";
//     }
//     if (internships.length) {
//       context += "Internships:\n" + internships.map(i => `- ${i.title} at ${i.company}`).join("\n") + "\n\n";
//     }

//     // 🔹 Call OpenAI
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are the AI Alumni Assistant. Use only the provided Firestore data." },
//         { role: "system", content: context },
//         { role: "user", content: message }
//       ]
//     });

//     const reply = completion.choices[0].message.content;
//     res.status(200).json({ reply });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Chatbot error" });
//   }
// }
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import OpenAI from "openai";

// 🔹 Firebase setup (init only once)
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// 🔹 OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // Fetch Firestore data
    const eventsSnap = await db.collection("events").get();
    const fundraisingSnap = await db.collection("fundraising").get();
    const internshipsSnap = await db.collection("internships").get();

    const events = eventsSnap.docs.map((d) => d.data());
    const fundraising = fundraisingSnap.docs.map((d) => d.data());
    const internships = internshipsSnap.docs.map((d) => d.data());

    // Build context for AI
    let context = "Here is the alumni platform data:\n\n";
    if (events.length)
      context += "Events:\n" + events.map((e) => `- ${e.title} on ${e.date}`).join("\n") + "\n\n";
    if (fundraising.length)
      context +=
        "Fundraising:\n" +
        fundraising.map((f) => `- ${f.campaignName}: ${f.amountRaised}/${f.goal}`).join("\n") +
        "\n\n";
    if (internships.length)
      context +=
        "Internships:\n" +
        internships.map((i) => `- ${i.title} at ${i.company}`).join("\n") +
        "\n\n";

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast + cheap
      messages: [
        { role: "system", content: "You are the AI Alumni Assistant. Use only the provided Firestore data." },
        { role: "system", content: context },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "Chatbot error" });
  }
}
