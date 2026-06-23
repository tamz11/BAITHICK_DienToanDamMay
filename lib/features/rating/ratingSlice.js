import { createSlice } from '@reduxjs/toolkit'

const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        setRatings: (state, action) => {
            state.ratings = action.payload
        },
        addRating: (state, action) => {
            state.ratings.push(action.payload)
        },
    }
})

// 🌟 ĐÃ FIX: Export cả setRatings ra để file page.jsx có thể sử dụng được
export const { setRatings, addRating } = ratingSlice.actions

export default ratingSlice.reducer