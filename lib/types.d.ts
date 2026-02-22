type CollectionType = {
    _id: string;
    title: string;
    description: string;
    image: string;
    products?: ProductType[];
    productCount?: number;
  }
  
  type ProductType = {
    _id: string;
    title: string;
    description: string;
    media: [string];
    category: string;
    collections: [CollectionType];
    tags: [string];
    sizes: [string];
    colors: [string];
    price: number;
    expense: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
type OrderColumnType = {
    _id: string;
    customer: string;
    country: string;
    products: number;
    totalAmount: number;
    currency: string;
    status: "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled";
    createdAt: string;
  }
  
  type OrderItemType = {
    product: ProductType
    color: string;
    size: string;
    quantity: number;
  }
  
type CustomerType = {
    _id?: string;
    clerkId: string;
    name: string;
    email: string;
    country?: string;
    createdAt?: string;
  }
