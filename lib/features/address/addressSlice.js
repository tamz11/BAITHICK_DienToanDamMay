import { addressDummyData } from '@/assets/assets'
import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
        defaultId: null,
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload)
            if (!state.defaultId) state.defaultId = action.payload.id
        },
        setAddresses: (state, action) => {
            state.list = action.payload || []
            state.defaultId = state.list && state.list.length > 0 ? state.list[0].id : null
        },
        setDefaultAddress: (state, action) => {
            state.defaultId = action.payload || null
        }
    }
})

export const { addAddress, setAddresses, setDefaultAddress } = addressSlice.actions

export default addressSlice.reducer