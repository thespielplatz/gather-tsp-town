module.exports = {
    makeAvatarUrl: (outfitString) => {
        let url = 'https://dynamic-assets.gather.town/sprite/avatar';
        const order = ['skin', 'bottom', 'shoes', 'top', 'glasses', 'facial_hair', 'hair', 'hat', 'other'];

        const outfit = JSON.parse(outfitString);

        // Try Costume
        try {
            return url + '-' + outfit['costume'].parts[0].spritesheetId + ".png";
        } catch (e) {}

        /* https://dynamic-assets.gather.town/sprite/avatar-
        dQCYs4n7O99ksXuBIe33 skin
        IeTiKgFytOsyQWBrQgAc bottom
        bjYIM3RJKVm2mwEI3BrQ shoes
        6313mtew3Zh1QX05N717 top
        PkaSuuEBwsEMkU6YXYzz glasses
        vCfMTJtUtaoRVjFBejU0 facial_hair
        f9h9IZO2XdpOVkvb8Jc7 hair
        FyHl5cB98OLsZhD2EkkD hat
        E5sJfYitFUYhAvDGzSOa other
        .png';
         */

        order.forEach(key => {
           const part = outfit[key];

           try {
               url += '-' + part.parts[0].spritesheetId;
           } catch (e) {
           }
        });

        url += '.png';

        return url;
    }
}
