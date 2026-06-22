import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import productReducer from './features/product/productSlice'
import addressReducer from './features/address/addressSlice'
import ratingReducer from './features/rating/ratingSlice'
import authReducer from './features/auth/authSlice'

const loadFromLocalStorage = (key) => {
    try {
        if (typeof window === 'undefined') return undefined
        const raw = localStorage.getItem(key)
        if (!raw) return undefined
        return JSON.parse(raw)
    } catch (e) {
        console.warn('Failed to load from localStorage', key, e)
        return undefined
    }
}

const saveToLocalStorage = (key, value) => {
    try {
        if (typeof window === 'undefined') return
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.warn('Failed to save to localStorage', key, e)
    }
}

export const makeStore = () => {
    const preloadedCart = loadFromLocalStorage('cart')
    const preloadedAddress = loadFromLocalStorage('address')

    // Normalize preloaded cart: ensure total exists if cartItems provided
    if (preloadedCart && typeof preloadedCart.total === 'undefined' && preloadedCart.cartItems) {
        preloadedCart.total = Object.values(preloadedCart.cartItems).reduce((s, v) => s + (Number(v) || 0), 0)
    }

    const store = configureStore({
        reducer: {
            cart: cartReducer,
            product: productReducer,
            address: addressReducer,
            rating: ratingReducer,
            auth: authReducer,
        },
        preloadedState: {
            ...(preloadedCart ? { cart: preloadedCart } : {}),
            ...(preloadedAddress ? { address: preloadedAddress } : {}),
        },
    })

    // Subscribe to store changes and persist cart/address to localStorage
    let prevCart = store.getState().cart
    let prevAddress = store.getState().address
    store.subscribe(() => {
        const state = store.getState()
        if (state.cart !== prevCart) {
            prevCart = state.cart
            saveToLocalStorage('cart', state.cart)
        }
        if (state.address !== prevAddress) {
            prevAddress = state.address
            saveToLocalStorage('address', state.address)
        }
    })

    return store
}