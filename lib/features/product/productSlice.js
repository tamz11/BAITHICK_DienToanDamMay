import { createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
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
        }
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer
