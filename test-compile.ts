const buyerProfile: any = undefined;
const foo = buyerProfile?.delivery_address.find((addr: any) => addr.id === 1);
console.log(foo);
