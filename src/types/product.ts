export interface ProductLocation {
  row: string;
  bay: string;
  shelf: string;
}

export interface Product {
  productName: string;
  image: string;
  price: number;
  location: ProductLocation;
}

export interface ProductSuggestion {
  productName: string;
}