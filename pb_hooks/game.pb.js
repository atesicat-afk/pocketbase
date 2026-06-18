// 1. SECURE ENDPOINT PARA SA PAG-SERVE NG PAGKAIN
routerAdd("POST", "/api/serve-food", (c) => {
    let user = c.get("authRecord");
    if (!user) return c.json(401, { error: "Bawal ang guest!" });

    // PURE JS OBJECT TRICK: Ginagawang purong JS object para gumana ang matematikang dagdag-barya
    let restoData = JSON.parse(JSON.stringify(user.get("restoData") || {}));
    
    let currentCoins = restoData.coins !== undefined ? parseInt(restoData.coins) : 1500; 
    let currentExp = restoData.exp !== undefined ? parseInt(restoData.exp) : 0;
    let currentLevel = restoData.level !== undefined ? parseInt(restoData.level) : 1;
    
    // Dito lang sa loob ng server pwedeng magdagdag ng pera at exp
    currentCoins += 15;
    currentExp += 5;

    let leveledUp = false;
    if (currentExp >= currentLevel * 50) {
        currentLevel++;
        currentExp = 0;
        leveledUp = true;
    }

    restoData.coins = currentCoins;
    restoData.exp = currentExp;
    restoData.level = currentLevel;

    user.set("restoData", restoData);

    try { $app.dao().saveRecord(user); } catch (e) { $app.save(user); }

    return c.json(200, {
        message: "Success",
        newCoins: currentCoins,
        newExp: currentExp,
        newLevel: currentLevel,
        leveledUp: leveledUp
    });
});

// 2. ANTI-CHEAT INTERCEPTOR (Dito natin sasaluhin ang normal na save ng laro)
onRecordBeforeUpdateRequest((e) => {
    if (e.record.collection().name !== "users") return;

    // Kunin ang orihinal at totoong data na nakaimbak na sa database
    let oldRecord = e.record.original();
    let oldResto = JSON.parse(JSON.stringify(oldRecord.get("restoData") || {}));
    
    // Kunin naman ang bagong data na gustong i-save ng player mula sa browser niya
    let newResto = JSON.parse(JSON.stringify(e.record.get("restoData") || {}));

    // IPERSIST ANG TOTOONG VALUE: Kahit palitan ng hacker ang coins sa 999999 sa console,
    // o-overwrite ito ng server gamit ang totoong coins na galing sa server-side database natin.
    newResto.coins = oldResto.coins !== undefined ? oldResto.coins : 1500;
    newResto.exp = oldResto.exp !== undefined ? oldResto.exp : 0;
    newResto.level = oldResto.level !== undefined ? oldResto.level : 1;

    // I-set ang ligtas na bersyon bago ito tuluyang pumasok sa database
    e.record.set("restoData", newResto);
});
