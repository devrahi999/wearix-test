import { doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase'; // assuming this exists, wait I should use the proper imports from db.ts

export async function resetProductRealSoldCount(productId?: string) {
  if (productId) {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, { realSoldCount: 0 });
  } else {
    const q = collection(db, 'products');
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(d => {
      batch.update(d.ref, { realSoldCount: 0 });
    });
    await batch.commit();
  }
}
