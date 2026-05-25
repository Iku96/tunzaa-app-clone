var buyerProfile = undefined;
var foo = buyerProfile === null || buyerProfile === void 0 ? void 0 : buyerProfile.delivery_address.find(function (addr) { return addr.id === 1; });
console.log(foo);
