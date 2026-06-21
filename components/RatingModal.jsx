'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (rating < 1 || rating > 5) {
            toast.error('Vui lòng chọn đánh giá từ 1 đến 5 sao');
            return;
        }
        if (review.length < 5) {
            toast.error('Nhận xét phải có ít nhất 5 ký tự');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: ratingModal?.productId,
                    orderId: ratingModal?.orderId,
                    rating,
                    review,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Lỗi gửi đánh giá');
            }

            const data = await response.json();
            dispatch(addRating(data.data));
            toast.success('Đánh giá thành công!');
            setRatingModal(null);
            setRating(0);
            setReview('');
        } catch (err) {
            console.error('Rating submission error:', err);
            toast.error(err.message || 'Lỗi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-96 relative'>
                <button onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-slate-600 mb-4'>Đánh giá sản phẩm</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
                    placeholder='Viếp nhận xét (tuy chọn)'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    disabled={loading}
                ></textarea>
                <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed'>
                    {loading ? 'Đang gửi...' : 'Gửi Đánh giá'}
                </button>
            </div>
        </div>
    )
}

export default RatingModal