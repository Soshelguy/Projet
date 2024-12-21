export const MAIN_CATEGORIES = [
    {
      id: 'products',
      name: 'Products',
      icon: 'basket-outline',
      color: '#8BC34A',
      subcategories: [
        {
          name: 'Beverages',
          icon: 'beer-outline',
          subsubcategories: {
            'Hot Drinks': ['Coffee', 'Tea', 'Hot Chocolate', 'Herbal Infusions', 'Chai Latte'],
            'Cold Drinks': ['Iced Coffee', 'Iced Tea', 'Smoothies', 'Milkshakes', 'Frozen Drinks'],
            'Soft Drinks': ['Cola', 'Lemonade', 'Energy Drinks', 'Sports Drinks', 'Sparkling Water'],
            'Juices': ['Fresh Fruit Juice', 'Vegetable Juice', 'Mixed Juice', 'Concentrated Juice', 'Coconut Water'],
            'Water': ['Still Water', 'Sparkling Water', 'Flavored Water', 'Mineral Water', 'Spring Water']
          }
        },
        {
          name: 'Snacks',
          icon: 'fast-food-outline',
          subsubcategories: {
            'Chips & Crisps': ['Potato Chips', 'Corn Chips', 'Tortilla Chips', 'Vegetable Chips', 'Rice Crisps'],
            'Nuts & Seeds': ['Almonds', 'Cashews', 'Pistachios', 'Peanuts', 'Mixed Nuts', 'Pumpkin Seeds'],
            'Sweet Snacks': ['Chocolates', 'Cookies', 'Candies', 'Protein Bars', 'Fruit Snacks'],
            'Healthy Snacks': ['Dried Fruits', 'Trail Mix', 'Granola Bars', 'Rice Cakes', 'Seaweed Snacks'],
            'Savory Snacks': ['Crackers', 'Popcorn', 'Pretzels', 'Beef Jerky', 'Rice Crackers']
          }
        },
        {
          name: 'Fruits & Vegetables',
          icon: 'nutrition-outline',
          subsubcategories: {
            'Fresh Fruits': ['Apples', 'Bananas', 'Oranges', 'Berries', 'Tropical Fruits'],
            'Fresh Vegetables': ['Leafy Greens', 'Root Vegetables', 'Cruciferous', 'Tomatoes', 'Peppers'],
            'Frozen': ['Frozen Fruits', 'Frozen Vegetables', 'Mixed Frozen', 'Smoothie Mixes'],
            'Dried': ['Dried Fruits', 'Sun-dried Tomatoes', 'Dried Mushrooms'],
            'Pre-cut': ['Cut Fruits', 'Salad Mixes', 'Stir-fry Mixes', 'Vegetable Platters']
          }
        }
      ]
    },
    {
      id: 'services',
      name: 'Services',
      icon: 'construct-outline',
      color: '#2196F3',
      subcategories: [
        {
          name: 'Home Services',
          icon: 'home-outline',
          subsubcategories: {
            'Cleaning': ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning'],
            'Repairs': ['Plumbing', 'Electrical', 'Appliance Repair', 'General Maintenance'],
            'Gardening': ['Lawn Mowing', 'Hedge Trimming', 'Weeding', 'Garden Design'],
            'Moving Services': ['Packing', 'Unpacking', 'Transportation', 'Storage Solutions']
          }
        },
        {
          name: 'Personal Services',
          icon: 'person-outline',
          subsubcategories: {
            'Fitness': ['Personal Training', 'Yoga Classes', 'Group Fitness', 'Home Gym Setup'],
            'Beauty': ['Hair Styling', 'Makeup', 'Nail Services', 'Spa Treatments'],
            'Tutoring': ['Math', 'Science', 'Languages', 'Music Lessons', 'Test Prep'],
            'Wellness': ['Massage Therapy', 'Meditation', 'Counseling', 'Nutritional Advice']
          }
        },
        {
          name: 'Tech Support',
          icon: 'laptop-outline',
          subsubcategories: {
            'IT Support': ['Network Setup', 'Data Recovery', 'System Troubleshooting', 'Software Installation'],
            'Web Development': ['Website Design', 'E-commerce Setup', 'SEO Services', 'Hosting Solutions'],
            'App Development': ['Mobile App Development', 'UI/UX Design', 'Testing', 'App Maintenance'],
            'Device Repairs': ['Smartphone Repair', 'Laptop Repair', 'Tablet Repair', 'Peripheral Repair']
          }
        }
      ]
    },
    {
      id: 'catering',
      name: 'Catering',
      icon: 'pizza-outline',
      color: '#F44336',
      subcategories: [
        {
          name: 'Groceries',
          icon: 'cart-outline',
          subsubcategories: {
            'Fresh Produce': ['Fruits', 'Vegetables'],
            'Meat & Fish': ['Chicken', 'Beef', 'Pork', 'Fish', 'Seafood'],
            'Dairy': ['Milk', 'Cheese', 'Butter', 'Yogurt', 'Cream'],
            'Frozen Foods': ['Frozen Vegetables', 'Frozen Snacks', 'Frozen Meals', 'Frozen Desserts']
          }
        },
        {
          name: 'Takeout',
          icon: 'restaurant-outline',
          subsubcategories: {
            'Pizza': ['Margherita', 'Pepperoni', 'Veggie', 'BBQ Chicken', 'Hawaiian'],
            'Burgers': ['Beef Burgers', 'Chicken Burgers', 'Veggie Burgers', 'Cheeseburgers'],
            'Sushi': ['Nigiri', 'Sashimi', 'Maki', 'Uramaki', 'Temaki'],
            'Sandwiches': ['Club Sandwich', 'BLT', 'Veggie Sandwich', 'Grilled Cheese']
          }
        },
        {
          name: 'Fast Food',
          icon: 'fast-food-outline',
          subsubcategories: {
            'Burgers': ['Cheeseburgers', 'Double Burgers', 'Chicken Burgers'],
            'Fries': ['Regular Fries', 'Cheese Fries', 'Curly Fries', 'Sweet Potato Fries'],
            'Shakes': ['Vanilla Shake', 'Chocolate Shake', 'Strawberry Shake', 'Oreo Shake'],
            'Tacos': ['Beef Tacos', 'Chicken Tacos', 'Fish Tacos', 'Veggie Tacos']
          }
        }
      ]
    },
    {
      id: 'non-consumables',
      name: 'Non-Consumables',
      icon: 'hammer-outline',
      color: '#9C27B0',
      subcategories: [
        {
          name: 'Repairs & Tools',
          icon: 'wrench-outline',
          subsubcategories: {
            'Power Tools': ['Drills', 'Saws', 'Sanders', 'Impact Wrenches'],
            'Hand Tools': ['Hammers', 'Screwdrivers', 'Pliers', 'Wrenches'],
            'Repair Kits': ['Electronics Kits', 'Car Repair Kits', 'Home Repair Kits']
          }
        },
        {
          name: 'Furniture',
          icon: 'sofa-outline',
          subsubcategories: {
            'Living Room': ['Sofas', 'Chairs', 'Coffee Tables', 'TV Stands'],
            'Bedroom': ['Beds', 'Wardrobes', 'Dressers', 'Nightstands'],
            'Office': ['Desks', 'Office Chairs', 'Bookshelves', 'File Cabinets']
          }
        },
        {
          name: 'Home Appliances',
          icon: 'home-outline',
          subsubcategories: {
            'Large Appliances': ['Refrigerators', 'Washing Machines', 'Air Conditioners', 'Ovens'],
            'Small Appliances': ['Microwaves', 'Blenders', 'Toasters', 'Coffee Makers']
          }
        }
      ]
    }
  ];
  