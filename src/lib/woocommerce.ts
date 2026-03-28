import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// These should be set in .env
const WOO_URL = process.env.WOO_URL || "https://example.com";
const WOO_KEY = process.env.WOO_KEY || "ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const WOO_SECRET = process.env.WOO_SECRET || "cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export const wooApi = new WooCommerceRestApi({
  url: WOO_URL,
  consumerKey: WOO_KEY,
  consumerSecret: WOO_SECRET,
  version: "wc/v3"
});

export async function syncProductToWoo(pimProduct: any) {
  const data = {
    name: pimProduct.title,
    type: "simple",
    regular_price: pimProduct.price?.toString() || "0",
    description: pimProduct.description || "",
    sku: pimProduct.sku,
    attributes: pimProduct.attributes.map((av: any) => ({
      name: av.attribute.name,
      options: [av.value],
      visible: true,
      variation: false,
    })),
  };

  try {
    // Check if product exists by SKU (better than ID for PIM-first sync)
    const existing = await wooApi.get("products", { sku: pimProduct.sku });
    
    if (existing.data.length > 0) {
      const wooId = existing.data[0].id;
      const response = await wooApi.put(`products/${wooId}`, data);
      return { success: true, wooId, action: "update" };
    } else {
      const response = await wooApi.post("products", data);
      return { success: true, wooId: response.data.id, action: "create" };
    }
  } catch (error: any) {
    console.error("WooCommerce Sync Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to sync with WooCommerce");
  }
}
