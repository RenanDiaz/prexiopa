# Database Models Documentation

This document details the MongoDB/Mongoose data models used in ThriftyTracker's backend.

## Overview

The application uses **7 main models** to track products, prices, receipts, and user information across different stores.

## Model Relationships

```
User (Authentication)

Receipt ──┬── belongs to ──> Store
          └── has many ──> Items

Item ──┬── belongs to ──> Receipt
       └── belongs to ──> Product

Product ──┬── belongs to ──> Unit
          └── has many ──> Categories
```

---

## Models

### 1. User Model

**File:** `src/models/userModel.js`

Stores user authentication and profile information.

#### Schema

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `username` | String | Yes | Yes | Unique username for login |
| `email` | String | Yes | Yes | User's email address |
| `password` | String | Yes | No | Hashed password (bcrypt) |
| `firstName` | String | No | No | User's first name |
| `lastName` | String | No | No | User's last name |
| `createdAt` | Date | Auto | No | Account creation timestamp |
| `updatedAt` | Date | Auto | No | Last update timestamp |

#### Features
- Timestamps enabled (`createdAt`, `updatedAt`)
- Password should be hashed before storage (bcrypt)
- Email and username must be unique

#### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2b$10$...",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-09-01T10:00:00.000Z",
  "updatedAt": "2023-09-01T10:00:00.000Z"
}
```

---

### 2. Store Model

**File:** `src/models/storeModel.js`

Represents retail stores where purchases are made.

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Store name (e.g., "Walmart", "Target") |

#### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Walmart"
}
```

---

### 3. Category Model

**File:** `src/models/categoryModel.js`

Product categories for organization (e.g., "Dairy", "Produce").

#### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Category name |

#### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Dairy"
}
```

---

### 4. Unit Model

**File:** `src/models/unitModel.js`

Measurement units for products (e.g., "kg", "L", "oz").

#### Schema

| Field | Type | Required | Enum Values | Description |
|-------|------|----------|-------------|-------------|
| `name` | String | Yes | - | Full unit name (e.g., "Kilogram") |
| `abbreviation` | String | Yes | - | Short form (e.g., "kg") |
| `type` | String | Yes | weight, volume, length, count, area, other | Unit type classification |

#### Unit Types
- **weight**: kg, g, lb, oz
- **volume**: L, mL, gal, qt
- **length**: m, cm, in, ft
- **count**: units, pieces, dozen
- **area**: m², ft²
- **other**: custom units

#### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Kilogram",
  "abbreviation": "kg",
  "type": "weight"
}
```

---

### 5. Product Model

**File:** `src/models/productModel.js`

Represents products that can be purchased (e.g., "Milk 1L", "Bread").

#### Schema

| Field | Type | Required | Reference | Description |
|-------|------|----------|-----------|-------------|
| `description` | String | Yes | - | Product description |
| `unit` | ObjectId | Yes | Unit | Measurement unit reference |
| `measurementValue` | Number | Yes | - | Amount/size (e.g., 1, 500, 2.5) |
| `tax` | Number | No (default: 0) | - | Tax percentage (0-100) |
| `categories` | [ObjectId] | No | Category | Array of category references |

#### Populated Example
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "description": "Whole Milk",
  "unit": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Liter",
    "abbreviation": "L",
    "type": "volume"
  },
  "measurementValue": 1,
  "tax": 0,
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Dairy"
    }
  ]
}
```

---

### 6. Receipt Model

**File:** `src/models/receiptModel.js`

Represents a shopping receipt from a store.

#### Schema

| Field | Type | Required | Default | Reference | Description |
|-------|------|----------|---------|-----------|-------------|
| `store` | ObjectId | Yes | - | Store | Store where purchase was made |
| `purchaseDate` | Date | Yes | Date.now | - | Date of purchase |

#### Notes
- A receipt contains multiple items (Items reference this receipt)
- Used to group purchased items from a single shopping trip

#### Example Document
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "store": "507f1f77bcf86cd799439012",
  "purchaseDate": "2023-09-01T14:30:00.000Z"
}
```

---

### 7. Item Model

**File:** `src/models/itemModel.js`

Represents individual items on a receipt (purchased products).

#### Schema

| Field | Type | Required | Default | Reference | Description |
|-------|------|----------|---------|-----------|-------------|
| `product` | ObjectId | Yes | - | Product | Product reference |
| `unitPrice` | Number | No | - | - | Price per unit |
| `totalPrice` | Number | Yes | - | - | Total price paid |
| `quantity` | Number | No | - | - | Quantity purchased |
| `discount` | Number | No | 0 | - | Discount amount |
| `receipt` | ObjectId | Yes | - | Receipt | Parent receipt |
| `createdAt` | Date | Auto | - | - | Creation timestamp |
| `updatedAt` | Date | Auto | - | - | Update timestamp |

#### Features
- Timestamps enabled
- Links products to receipts
- Tracks pricing information for historical analysis

#### Populated Example
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "product": {
    "_id": "507f1f77bcf86cd799439015",
    "description": "Whole Milk",
    "unit": "507f1f77bcf86cd799439014",
    "measurementValue": 1
  },
  "unitPrice": 3.99,
  "totalPrice": 7.98,
  "quantity": 2,
  "discount": 0,
  "receipt": "507f1f77bcf86cd799439016",
  "createdAt": "2023-09-01T14:30:00.000Z",
  "updatedAt": "2023-09-01T14:30:00.000Z"
}
```

---

## Data Flow Example

### Creating a Receipt with Items

1. **User** logs in → authenticate with User model
2. Create a **Receipt** for store purchase
3. Add **Items** to the receipt:
   - Each item references a **Product**
   - Product has a **Unit** (e.g., liter, kilogram)
   - Product has **Categories** (e.g., dairy, produce)
4. Track pricing over time by querying items by product across receipts

### Price History Query

To track price history for a product:

```javascript
// Find all items for a specific product, sorted by date
const priceHistory = await Item.find({ product: productId })
  .populate({
    path: 'receipt',
    populate: { path: 'store' }
  })
  .sort({ 'receipt.purchaseDate': -1 });

// Returns items with their prices and store information over time
```

---

## Indexes

### Recommended Indexes

For optimal performance, consider adding these indexes:

```javascript
// User
User.index({ email: 1 });
User.index({ username: 1 });

// Product
Product.index({ description: 'text' });
Product.index({ categories: 1 });

// Item
Item.index({ product: 1, receipt: 1 });
Item.index({ receipt: 1 });

// Receipt
Receipt.index({ store: 1, purchaseDate: -1 });
```

---

## Business Logic

### Price Comparison

The core functionality allows:
- Tracking product prices across different stores
- Historical price trends
- Best deal identification

### Calculations

**Total Receipt Amount:**
```javascript
const total = items.reduce((sum, item) => sum + item.totalPrice - item.discount, 0);
```

**Unit Price Comparison:**
```javascript
const unitPrice = item.totalPrice / (item.product.measurementValue * item.quantity);
```

---

## MongoDB Collections

When deployed, these models create the following collections:

- `users` (User model)
- `stores` (Store model)
- `categories` (Category model)
- `units` (Unit model)
- `products` (Product model)
- `receipts` (Receipt model)
- `items` (Item model)

---

## Notes

- All ObjectId references use Mongoose's `ref` feature for population
- Timestamps are automatically managed by Mongoose
- Required fields are validated at the schema level
- Consider adding validation middleware for business rules
- Password hashing should be handled before saving User documents

---

**Last Updated:** 2025-11-22
