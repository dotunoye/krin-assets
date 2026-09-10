export default {
  name: 'product',
  title: 'Shop Product',
  type: 'document',
  fields: [
    { 
      name: 'title', 
      title: 'Product Title', 
      type: 'string', 
      validation: Rule => Rule.required() 
    },
    { 
      name: 'description', 
      title: 'Description', 
      type: 'text', 
      validation: Rule => Rule.required() 
    },
    { 
      name: 'price', 
      title: 'Price (₦)', 
      type: 'number', 
      validation: Rule => Rule.required() 
    },
    { 
      name: 'image', 
      title: 'Main Image', 
      type: 'image', 
      options: { hotspot: true } 
    },
    {
      name: 'gallery',
      title: 'Product Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    },
    { 
      name: 'inStock', 
      title: 'In Stock', 
      type: 'boolean', 
      initialValue: true 
    }
  ]
}