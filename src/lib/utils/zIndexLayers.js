/**
 * Z-Index Layer Management
 * 
 * This file defines the z-index hierarchy to prevent overlay conflicts.
 * Higher numbers appear above lower numbers.
 */

export const Z_INDEX_LAYERS = {
    // Base layer
    BASE: 0,

    // Content layers
    CONTENT: 10,
    DROPDOWN: 20,

    // Navigation
    NAVBAR: 50,

    // Overlays (lowest priority)
    MODAL_BACKDROP: 9990,

    // Modals (ordered by priority)
    SPLASH_SCREEN: 9996,
    CHART_MODAL: 9997,
    WALLET_DROPDOWN: 9999,
    WALLET_CONNECT_MODAL: 9998,

    // Critical overlays (highest priority)
    NOTIFICATION: 10000,
    TOOLTIP: 10001,
    DEBUG_OVERLAY: 10002
};

/**
 * Get z-index value for a specific layer
 */
export function getZIndex(layer) {
    return Z_INDEX_LAYERS[layer] || Z_INDEX_LAYERS.BASE;
}

/**
 * Generate Tailwind CSS class for z-index
 */
export function getZIndexClass(layer) {
    const value = getZIndex(layer);

    // For standard Tailwind values (0, 10, 20, 30, 40, 50)
    if (value <= 50 && value % 10 === 0) {
        return `z-${value}`;
    }

    // For custom values, use arbitrary value syntax
    return `z-[${value}]`;
}

/**
 * CSS-in-JS z-index values
 */
export function getZIndexStyle(layer) {
    return { zIndex: getZIndex(layer) };
}
