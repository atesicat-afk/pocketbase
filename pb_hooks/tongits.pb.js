// pb_hooks/tongits.pb.js

routerAdd("POST", "/api/game/tongits-result", (c) => {
    // 1. I-verify kung sino ang naka-login na user
    const user = c.get("authRecord");
    if (!user) {
        return c.json(401, { error: "Kailangan mong mag-login." });
    }

    // 2. Kunin ang data galing sa frontend (Resulta ng laro)
    const data = $apis.requestInfo(c).data;
    const isWin = data.isWin;
    const betAmount = data.betAmount || 10; // Default na taya
    
    // Safety check: Wag payagan ang sobrang laking taya o negative bets
    if (betAmount <= 0 || betAmount > 500) {
        return c.json(400, { error: "Invalid bet amount." });
    }

    // 3. Kalkulahin ang bagong balance
    let currentCoins = user.getInt("virtual_coins");
    
    if (isWin) {
        currentCoins += betAmount; // Panalo
    } else {
        currentCoins -= betAmount; // Talo
    }

    // 4. Siguraduhing hindi magne-negative ang pera
    if (currentCoins < 0) {
        currentCoins = 0;
    }

    // 5. I-save sa database gamit ang Admin/Server privileges
    user.set("virtual_coins", currentCoins);
    $app.dao().saveRecord(user);

    // 6. Ibalik ang bagong balance sa frontend
    return c.json(200, { 
        success: true, 
        message: isWin ? "Nanalo ka!" : "Talo ka.",
        newBalance: currentCoins 
    });
});
