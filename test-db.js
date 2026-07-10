import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNJB4X8Fl1Az5x-3G4loW8IcxptCLiijM",
  authDomain: "wearix-999.firebaseapp.com",
  projectId: "wearix-999"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    // try to read a dummy order
    const snap = await getDoc(doc(db, 'orders', 'DUMMY'));
    console.log("Success reading without auth");
  } catch (err) {
    console.error("Failed to read:", err.message);
  }
}
test();
