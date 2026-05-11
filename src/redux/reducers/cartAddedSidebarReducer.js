const initialState = {
  show: false,
  addedProduct: null,
  quantity: 1,
};

const cartAddedSidebarReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SHOW_CART_ADDED_SIDEBAR":
      return {
        show: true,
        addedProduct: action.payload.product,
        relatedProducts: action.payload.relatedProducts || [],
        quantity: action.payload.quantity,
      };
    case "HIDE_CART_ADDED_SIDEBAR":
      return initialState;
    default:
      return state;
  }
};

export default cartAddedSidebarReducer;
