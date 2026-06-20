import { createSlice } from '@reduxjs/toolkit'
<<<<<<< HEAD
=======
import { productDummyData } from '@/assets/assets'
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09

const productSlice = createSlice({
    name: 'product',
    initialState: {
<<<<<<< HEAD
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload || []
        },
        clearProduct: (state) => {
            state.list = []
=======
        list: productDummyData, // Khởi tạo với dữ liệu đồ điện tử mẫu
    },
    reducers: {
        setProduct: (state, action) => {
            // Kết hợp dữ liệu mẫu và dữ liệu từ Database
            // action.payload là danh sách sản phẩm lấy từ DB
            state.list = [...productDummyData, ...action.payload]
        },
        clearProduct: (state) => {
            state.list = productDummyData
>>>>>>> 5e6f11fbe23afe2ef2180f979c7d843b9b483f09
        }
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer
