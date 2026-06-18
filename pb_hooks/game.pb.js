routerAdd("POST", "/api/serve-food", (c) => {
    // 1. Siguraduhing naka-login ang player
    let user = c.get("authRecord");
    if (!user) {
        return c.json(401, { error: "Bawal ang guest!" });
    }

    // 2. Kunin ang kasalukuyang laro ng player (restoData)
    let restoData = user.get("restoData");
    if (typeof restoData === 'string') {
        try { restoData = JSON.parse(restoData); } catch(e) { restoData = {}; }
    } else if (!restoData) {
        restoData = {};
    }
    
    // 3. Basahin ang coins, exp, at level
    let currentCoins = restoData.coins !== undefined ? parseInt(restoData.coins) : 1500; 
    let currentExp = restoData.exp !== undefined ? parseInt(restoData.exp) : 0;
    let currentLevel = restoData.level !== undefined ? parseInt(restoData.level) : 1;
    
    // 4. Server ang magku-kwenta ng dagdag (+15 barya, +5 exp)
    currentCoins += 15;
    currentExp += 5;

    let leveledUp = false;
    // Formula ng level up mula sa laro mo: level * 50
    if (currentExp >= currentLevel * 50) {
        currentLevel++;
        currentExp = 0;
        leveledUp = true;
    }

    // 5. I-update ang mga values sa loob ng data block
    restoData.coins = currentCoins;
    restoData.exp = currentExp;
    restoData.level = currentLevel;

    user.set("restoData", restoData);

    // Ligtas na pag-save sa database ng PocketBase
    try {
        $app.dao().saveRecord(user);
    } catch (e) {
        $app.save(user);
    }

    // 6. Ibalik sa browser ang mga bagong bilang para mag-update ang UI ng laro
    return c.json(200, {
        message: "Success",
        newCoins: currentCoins,
        newExp: currentExp,
        newLevel: currentLevel,
        leveledUp: leveledUp
    });
});
