const avatar = require('../controller/gather/avatar');
let outfitString, url;

const myOutFitUrl = 'https://dynamic-assets.gather.town/sprite/avatar-M8h5xodUHFdMzyhLkcv9-IeTiKgFytOsyQWBrQgAc-bjYIM3RJKVm2mwEI3BrQ-6313mtew3Zh1QX05N717-PkaSuuEBwsEMkU6YXYzz-f9h9IZO2XdpOVkvb8Jc7.png';
const fullOutfitUrl = 'https://dynamic-assets.gather.town/sprite/avatar-dQCYs4n7O99ksXuBIe33-IeTiKgFytOsyQWBrQgAc-bjYIM3RJKVm2mwEI3BrQ-6313mtew3Zh1QX05N717-PkaSuuEBwsEMkU6YXYzz-vCfMTJtUtaoRVjFBejU0-f9h9IZO2XdpOVkvb8Jc7-FyHl5cB98OLsZhD2EkkD-E5sJfYitFUYhAvDGzSOa.png';
const seasonalOutfitUrl = 'https://dynamic-assets.gather.town/sprite/avatar-uW3AdTs9Tl38CPWZ0YaX.png';

const fullOutfit = require('./avatar-full.json');
const myOutFit = require('./avatar-my.json');
const seasonalOutfit = require('./avatar-seasonal.json');

outfitString = JSON.stringify(fullOutfit);
url = avatar.makeAvatarUrl(outfitString);
console.log(`Check Full Outfit: ${fullOutfitUrl === url ? "✅ " : "🚨 "}`);

outfitString = JSON.stringify(myOutFit);
url = avatar.makeAvatarUrl(outfitString);
console.log(`Check My Outfit: ${myOutFitUrl === url ? "✅ " : "🚨 "}`);

outfitString = JSON.stringify(seasonalOutfit);
url = avatar.makeAvatarUrl(outfitString);
console.log(`Check Custome Outfit: ${seasonalOutfitUrl === url ? "✅ " : "🚨 "}`);
