import type { PromotionSettings } from './db';

// Helper to check if a promotion is currently active based on date rules
export function isPromotionActive(
  enabled: boolean,
  startDateStr: string,
  endDateStr: string
): boolean {
  if (!enabled) return false;
  
  const now = new Date();
  
  if (startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    if (now < start) return false;
  }
  
  if (endDateStr) {
    const end = new Date(endDateStr);
    // Include the entire end date (up to 23:59:59)
    end.setHours(23, 59, 59, 999);
    if (now > end) return false;
  }
  
  return true;
}

export function calculateBuyMoreDiscount(
  subtotal: number,
  totalItems: number,
  promotions: PromotionSettings | null
): { discountAmount: number; isActive: boolean; qualified: boolean } {
  if (!promotions) return { discountAmount: 0, isActive: false, qualified: false };

  const isActive = isPromotionActive(
    promotions.buyMoreEnabled,
    promotions.buyMoreStartDate,
    promotions.buyMoreEndDate
  );

  if (!isActive) return { discountAmount: 0, isActive: false, qualified: false };

  const qualified = totalItems >= promotions.buyMoreMinQty;
  const discountAmount = qualified ? Math.round((subtotal * promotions.buyMoreDiscountPct) / 100) : 0;

  return { discountAmount, isActive, qualified };
}

export function calculateFreeDelivery(
  subtotalAfterDiscounts: number, // Including coupon and buy more discounts
  promotions: PromotionSettings | null,
  hasFreeDeliveryProduct: boolean = false
): { isFreeDelivery: boolean; isActive: boolean; qualified: boolean } {
  if (hasFreeDeliveryProduct) {
    return { isFreeDelivery: true, isActive: true, qualified: true };
  }

  if (!promotions) return { isFreeDelivery: false, isActive: false, qualified: false };

  const isActive = isPromotionActive(
    promotions.freeDeliveryEnabled,
    promotions.freeDeliveryStartDate,
    promotions.freeDeliveryEndDate
  );

  if (!isActive) return { isFreeDelivery: false, isActive: false, qualified: false };

  const qualified = subtotalAfterDiscounts >= promotions.freeDeliveryMinOrder;
  return { isFreeDelivery: qualified, isActive, qualified };
}
