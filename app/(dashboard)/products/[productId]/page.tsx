"use client"

import Loader from '@/components/custom ui/Loader'
import ProductForm from '@/components/products/ProductForm'
import React, { useCallback, useEffect, useState } from 'react'

const ProductDetails = ({ params }: { params: { productId: string }}) => {
  const [loading, setLoading] = useState(true)
  const [productDetails, setProductDetails] = useState<ProductType | null>(null)

  const getProductDetails = useCallback(async () => {
    try { 
      const res = await fetch(`/api/products/${params.productId}`, {
        method: "GET",
        cache: "no-store",
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const data = await res.json()
      setProductDetails(data)
    } catch (err) {
      console.log("[productId_GET]", err)
    } finally {
      setLoading(false)
    }
  }, [params.productId])

  useEffect(() => {
    getProductDetails()
  }, [getProductDetails])

  return loading ? <Loader /> : (
    <ProductForm initialData={productDetails} />
  )
}

export default ProductDetails
