import { addressDummyData } from '@/assets/assets'
import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
<<<<<<< HEAD
        list: [],
=======
        list: [addressDummyData],
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
    }
})

export const { addAddress } = addressSlice.actions

export default addressSlice.reducer