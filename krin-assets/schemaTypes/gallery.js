export default {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    { name: 'title', title: 'Internal Title / Alt Text', type: 'string' },
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
    {
      name: 'category',
      title: 'Event Category',
      type: 'string',
      options: {
        list: ['Prophetic Kids', 'After School Haven', 'Learning', 'Team']
      }
    }
  ]
}