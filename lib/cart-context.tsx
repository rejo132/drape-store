"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "drape-cart";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  isHydrated: boolean;
};

type AddItemAction = {
  type: "ADD_ITEM";
  payload: Omit<CartItem, "quantity"> & { quantity?: number };
};

type RemoveItemAction = {
  type: "REMOVE_ITEM";
  payload: { productId: string; size: string };
};

type UpdateQuantityAction = {
  type: "UPDATE_QUANTITY";
  payload: { productId: string; size: string; quantity: number };
};

type ClearCartAction = {
  type: "CLEAR_CART";
};

type HydrateAction = {
  type: "HYDRATE";
  payload: CartItem[];
};

export type CartAction =
  | AddItemAction
  | RemoveItemAction
  | UpdateQuantityAction
  | ClearCartAction
  | HydrateAction;

function getItemKey(productId: string, size: string): string {
  return `${productId}:${size}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.payload, isHydrated: true };
    case "ADD_ITEM": {
      const quantity = action.payload.quantity ?? 1;
      const key = getItemKey(action.payload.productId, action.payload.size);
      const existingIndex = state.items.findIndex(
        (item) => getItemKey(item.productId, item.size) === key
      );

      if (existingIndex === -1) {
        return {
          ...state,
          items: [
            ...state.items,
            {
              productId: action.payload.productId,
              name: action.payload.name,
              price: action.payload.price,
              size: action.payload.size,
              quantity,
              image: action.payload.image,
            },
          ],
        };
      }

      const items = [...state.items];
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: items[existingIndex].quantity + quantity,
      };

      return { ...state, items };
    }
    case "REMOVE_ITEM": {
      const key = getItemKey(
        action.payload.productId,
        action.payload.size
      );
      return {
        ...state,
        items: state.items.filter(
          (item) => getItemKey(item.productId, item.size) !== key
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      const key = getItemKey(
        action.payload.productId,
        action.payload.size
      );

      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => getItemKey(item.productId, item.size) !== key
          ),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          getItemKey(item.productId, item.size) === key
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  dispatch: Dispatch<CartAction>;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function parseStoredCart(value: string | null): CartItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.size === "string" &&
        typeof item.quantity === "number" &&
        typeof item.image === "string"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isHydrated: false,
  });

  useEffect(() => {
    const stored = parseStoredCart(localStorage.getItem(CART_STORAGE_KEY));
    dispatch({ type: "HYDRATE", payload: stored });
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, state.isHydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      dispatch({ type: "ADD_ITEM", payload: item });
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size } });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, size, quantity },
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  const itemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      itemCount,
      subtotal,
      isHydrated: state.isHydrated,
      dispatch,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      state.items,
      state.isHydrated,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
