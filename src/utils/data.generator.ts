import { faker } from '@faker-js/faker';

export class DataGenerator {
  // User data generators
  static generateUser() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    
    return {
      firstName,
      lastName,
      email,
      username: faker.internet.userName({ firstName, lastName }),
      password: faker.internet.password({ length: 12, memorable: false }),
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      avatar: faker.image.avatar(),
    };
  }

  // Address data generators
  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
    };
  }

  // Product data generators
  static generateProduct() {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      inStock: faker.datatype.boolean(),
      quantity: faker.number.int({ min: 0, max: 100 }),
      images: Array.from({ length: 3 }, () => faker.image.url()),
      rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
      reviews: faker.number.int({ min: 0, max: 1000 }),
    };
  }

  // Credit card data generators
  static generateCreditCard() {
    return {
      number: faker.finance.creditCardNumber(),
      cvv: faker.finance.creditCardCVV(),
      expiryDate: faker.date.future({ years: 5 }).toLocaleDateString('en-US', { 
        month: '2-digit', 
        year: '2-digit' 
      }),
      holderName: faker.person.fullName(),
      type: faker.helpers.arrayElement(['Visa', 'MasterCard', 'American Express', 'Discover']),
    };
  }

  // Company data generators
  static generateCompany() {
    return {
      name: faker.company.name(),
      catchPhrase: faker.company.catchPhrase(),
      bs: faker.company.buzzPhrase(),
      ein: faker.string.numeric(9),
      industry: faker.helpers.arrayElement([
        'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
        'Education', 'Entertainment', 'Transportation', 'Real Estate'
      ]),
      employees: faker.number.int({ min: 10, max: 10000 }),
      founded: faker.date.past({ years: 50 }).getFullYear(),
      website: faker.internet.url(),
    };
  }

  // Order data generators
  static generateOrder() {
    const orderDate = faker.date.recent({ days: 30 });
    const status = faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
    
    return {
      orderId: faker.string.uuid(),
      orderDate,
      estimatedDelivery: faker.date.future({ years: 0, refDate: orderDate }),
      status,
      total: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      items: faker.number.int({ min: 1, max: 5 }),
      shippingMethod: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
      trackingNumber: status === 'shipped' || status === 'delivered' 
        ? faker.string.alphanumeric(20).toUpperCase() 
        : null,
    };
  }

  // Review data generators
  static generateReview() {
    return {
      reviewId: faker.string.uuid(),
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      comment: faker.lorem.paragraph(),
      author: faker.person.fullName(),
      date: faker.date.recent({ days: 180 }),
      verified: faker.datatype.boolean(),
      helpful: faker.number.int({ min: 0, max: 100 }),
      images: faker.datatype.boolean() 
        ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.image.url())
        : [],
    };
  }

  // Utility methods
  static generateEmail(options?: { domain?: string; prefix?: string }): string {
    const prefix = options?.prefix || faker.internet.userName();
    const domain = options?.domain || faker.internet.domainName();
    return `${prefix}_${Date.now()}@${domain}`;
  }

  static generatePhoneNumber(format = '(###) ###-####'): string {
    return faker.phone.number(format);
  }

  static generatePassword(options?: { 
    length?: number; 
    uppercase?: boolean; 
    lowercase?: boolean; 
    numbers?: boolean; 
    symbols?: boolean; 
  }): string {
    const length = options?.length || 12;
    const pattern = new RegExp(
      `^${options?.uppercase !== false ? '(?=.*[A-Z])' : ''}` +
      `${options?.lowercase !== false ? '(?=.*[a-z])' : ''}` +
      `${options?.numbers !== false ? '(?=.*[0-9])' : ''}` +
      `${options?.symbols !== false ? '(?=.*[!@#$%^&*])' : ''}` +
      `.{${length},}$`
    );
    
    return faker.internet.password({ 
      length, 
      pattern,
      memorable: false 
    });
  }

  static generateDate(options?: { 
    min?: Date; 
    max?: Date; 
    future?: boolean; 
    past?: boolean; 
  }): Date {
    if (options?.future) {
      return faker.date.future({ refDate: options.min });
    }
    if (options?.past) {
      return faker.date.past({ refDate: options.max });
    }
    return faker.date.between({ 
      from: options?.min || new Date('2020-01-01'), 
      to: options?.max || new Date() 
    });
  }
}