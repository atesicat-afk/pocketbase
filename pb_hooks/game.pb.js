// 1. SECURE ENDPOINT PARA SA PAG-SERVE
routerAdd("POST", "/api/serve-food", (c) => {
    let user = c.get("authRecord");
    if (!user) return c.json(401, { error: "Bawal ang guest!" });

    // Direktang pagbasa nang walang JSON.stringify na nagpapa-crash
    let restoData = user.get("restoData");
    if (typeof restoData === 'string') {
        try { restoData = JSON.parse(restoData); } catch(e) { restoData = {}; }
    } else if (!restoData) {
        restoData = {};
    }
    
    let currentCoins = restoData.coins !== undefined ? parseInt(restoData.coins) : 1500; 
    let currentExp = restoData.exp !== undefined ? parseInt(restoData.exp) : 0;
    let currentLevel = restoData.level !== undefined ? parseInt(restoData.level) : 1;
    
    // Dagdag barya at exp
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

// 2. ANTI-CHEAT INTERCEPTOR
onRecordBeforeUpdateRequest((e) => {
    if (e.record.collection().name !== "users") return;

    let oldRecord = e.record.original();
    
    // Ligtas na pagbasa ng luma at bagong data
    let oldResto = oldRecord.get("restoData");
    if (typeof oldResto === 'string') { try { oldResto = JSON.parse(oldResto); } catch(err) { oldResto = {}; } }
    else if (!oldResto) { oldResto = {}; }

    let newResto = e.record.get("restoData");
    if (typeof newResto === 'string') { try { newResto = JSON.parse(newResto); } catch(err) { newResto = {}; } }
    else if (!newResto) { newResto = {}; }

    // Pinoprotektahan ang pera laban sa mga nag-e-edit sa console
    newResto.coins = oldResto.coins !== undefined ? oldResto.coins : 1500;
    newResto.exp = oldResto.exp !== undefined ? oldResto.exp : 0;
    newResto.level = oldResto.level !== undefined ? oldResto.level : 1;

    e.record.set("restoData", newResto);
});
