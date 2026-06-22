import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        setAddressList: (state, action) => {
            state.list = action.payload
        },
        addAddress: (state, action) => {
            state.list.unshift(action.payload) // Thêm vào đầu danh sách
        },
    }
})

export const { setAddressList, addAddress } = addressSlice.actions

export default addressSlice.reducer