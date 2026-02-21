from app.services.ai_service import chat_completion


def build_forecast_prompt(product: dict, transactions: list[dict]) -> str:
    if transactions:
        tx_lines = "\n".join(
            f"  {t['timestamp'][:10] if isinstance(t['timestamp'], str) else str(t['timestamp'])[:10]}: "
            f"{t['transaction_type']} {t['quantity']:+d} units"
            for t in transactions[-30:]
        )
    else:
        tx_lines = "  No transaction history available yet."

    return f"""Analyze this product's inventory data and generate a 30-day demand forecast.

Product: {product['name']} (SKU: {product['sku']})
Category: {product.get('category', 'Unknown')}
Current Stock: {product['current_stock']} units
Reorder Point: {product['reorder_point']} units
Reorder Quantity: {product['reorder_quantity']} units
Lead Time: {product['lead_time_days']} days
Supplier: {product.get('supplier', 'Unknown')}

Recent Transaction History:
{tx_lines}

Provide a structured forecast with:
1. Estimated daily demand rate (units/day)
2. Projected stock-out date (if current trend continues)
3. Recommended reorder date (accounting for lead time)
4. Recommended order quantity
5. Key risks or factors to watch

Format clearly so a supply chain manager can act on it immediately."""


def generate_forecast(product: dict, transactions: list[dict]) -> str:
    prompt = build_forecast_prompt(product, transactions)
    return chat_completion([{"role": "user", "content": prompt}])
