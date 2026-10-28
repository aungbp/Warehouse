export interface ProductLocation {
  row: string;
  bay: string;
  shelf: string;
}

export interface Product {
  id: string;
  productName: string;
  image: string;
  price: number;
  location: ProductLocation;
}

export interface ProductSearchResponse {
  products: Product[];
  totalReturned: number;
}