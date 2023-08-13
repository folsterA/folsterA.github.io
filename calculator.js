const Categories = {
    instinct: 0,
    discipline: 1,
    focus: 2
}

const Stats = {
    "Max Health": 0,
    "Resilience": 1,
    "Weapon Power": 2,
    "Ability Power": 3,
    "Crit Rating": 4,
    "Crit Power": 5,
    "Break Power": 6,
    "Phys Defense": 7,
    "Mag Defense": 8
}

const statLabels = [
    "Max Health",
    "Resilience",
    "Weapon Power",
    "Ability Power",
    "Crit Rating",
    "Crit Power",
    "Break Power",
    "Phys Defense",
    "Mag Defense",
    "Power"    
]


class ModifierGroup {
    constructor() {
        this.budgetMods = [7.5, 4.5, 1.13, 1.13, 1.13, 1.13, 1.13, 1.88, 1.88];
        this.genericMods = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        this.displayMods = [1, 2, 10, 10, 10, 10, 10, 10, 10];
    }
}

var mods = new ModifierGroup();

class Wayfinder {
    constructor() {
        this.id = 0;
        this.displayName = "";
        this.level = 1;
        this.awakening = 0;
        this.baseStats = [];
        this.internalStats = [];
        this.displayStats = [];
        this.baseStatTotal = 120;
        this.affinities = [];
    }
}

var selectedWayfinder = new Wayfinder();
var allWayfinders = [];

class Weapon {
    constructor() {
        this.id = 0;
        this.displayName = "";
        this.level = 1;
        this.reinforcements = 0;
        this.temper = 0;
        this.baseStats = [];
        this.internalStats = [];
        this.displayStats = [];
        this.baseStatTotal = 120;
        this.affinities = [];
        this.perLevelBudgetIncrease = 0;
        this.perTemperBudgetIncrease = 0;
        this.perRankBudgetIncrease = 0;
    }
}

var selectedWeapon = new Weapon();
var allWeapons = [];

class Accessory {
    constructor() {
        this.id = 0;
        this.displayName = "";
        this.level = 1;
        this.baseStats = [];
        this.baseStatTotal = 120;
        this.internalStats = [];
        this.displayStats = [];
        this.perLevelBudgetIncrease = 0;
    }
}

var selectedAccessories = [];
var allAccessories = [];

class Echo {
    constructor() {
        this.stat = "";
        this.value = 0;
        this.cost = 0;
    }
}

var echoList = [];

var beginUpdating = false;

$(document).ready(async function () {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    await loadWayfinderData();
    await loadWeaponData();
    await loadAccessoryData();
    // load echo data

    populateDropdowns();

    attachControls();

    fullUpdate();
});

function fullUpdate() {
    updateWayfinderTables();
    updateWeaponTables()
    updateAccessoryTables();
    updateTotals();
}

async function loadWayfinderData() {
    var wayfinderData;
    await fetch("./json/CharacterInventoryItems.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => wayfinderData = data[0].Rows);

    var numWayfinder = 0;
    for (var wayfinderName in wayfinderData) {
        if (Object.prototype.hasOwnProperty.call(wayfinderData, wayfinderName)) {
            var statData = wayfinderData[wayfinderName].EquipmentData.AttributeBudgetPoints.Entries;
            
            var newWayfinder = new Wayfinder();
            newWayfinder.id = numWayfinder;
            numWayfinder++;
            newWayfinder.displayName = wayfinderData[wayfinderName].DisplayName.Key;
            var baseStatTotal = 0;
            for (let i = 0; i < 9; i++) {
                newWayfinder.baseStats[i] = statData[i].Amount.Value;
                baseStatTotal += newWayfinder.baseStats[i];
            }
            newWayfinder.baseStatTotal = Math.round(baseStatTotal);
            allWayfinders.push(newWayfinder);
        }
    }
}

async function loadWeaponData() {
    var weaponData;
    await fetch("./json/item_weapon.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => weaponData = data);

    var numWeapons = 0;
    for (var weaponName in weaponData) {
        if (Object.prototype.hasOwnProperty.call(weaponData, weaponName)) {
            var newWeapon = new Weapon();
            newWeapon.id = numWeapons;
            numWeapons++;
            newWeapon.displayName = weaponData[weaponName].name;
            var attributeScaling = weaponData[weaponName].attributeAutoScalingData;
            newWeapon.perLevelBudgetIncrease = attributeScaling.PerLevelBudgetIncrement;
            newWeapon.perTemperBudgetIncrease = attributeScaling.PerTemperBudgetIncrements;
            newWeapon.perRankBudgetIncrease = attributeScaling.PerRankBudgetIncrements;

            var statData = weaponData[weaponName].attributes;
            var statIndex = 0;
            var baseStatTotal = 0;
            for (var statCategory in statData) {
                if (Object.prototype.hasOwnProperty.call(statData, statCategory)) {
                    for (var stat in statData[statCategory]) {
                        if (Object.prototype.hasOwnProperty.call(statData[statCategory], stat)) {
                            newWeapon.baseStats[statIndex] = {
                                value: statData[statCategory][stat],
                                type: stat.toString(),
                                category: statCategory.toString().toLowerCase()
                            }
                            baseStatTotal += newWeapon.baseStats[statIndex].value;
                            statIndex++;
                        }
                    }
                }
            }

            newWeapon.baseStatTotal = Math.round(baseStatTotal);
            allWeapons.push(newWeapon);
        }
    }
}

async function loadAccessoryData() {
    // var weaponData;
    var accessoryData;
    await fetch("./json/item_accessory.json")
        .then((res) => {
            return res.json();
        })
        .then((data) => accessoryData = data);
        
    var numAccessories = 0;
    for (var accessoryName in accessoryData) {
        if (Object.prototype.hasOwnProperty.call(accessoryData, accessoryName)) {
            var newAccessory = new Accessory();
            newAccessory.id = numAccessories;
            numAccessories++;
            newAccessory.displayName = accessoryData[accessoryName].name;
            newAccessory.perLevelBudgetIncrease = accessoryData[accessoryName].attributeAutoScalingData.PerLevelBudgetIncrement;

            var statData = accessoryData[accessoryName].attributes;
            var statIndex = 0;
            var baseStatTotal = 0;
            for (var statCategory in statData) {
                if (Object.prototype.hasOwnProperty.call(statData, statCategory)) {
                    for (var stat in statData[statCategory]) {
                        if (Object.prototype.hasOwnProperty.call(statData[statCategory], stat)) {
                            newAccessory.baseStats[statIndex] = {
                                value: statData[statCategory][stat],
                                type: stat.toString(),
                                category: statCategory.toString().toLowerCase()
                            }
                            baseStatTotal += newAccessory.baseStats[statIndex].value;
                            statIndex++;
                        }
                    }
                }
            }

            newAccessory.baseStatTotal = Math.round(baseStatTotal);
            allAccessories.push(newAccessory);
            
        }
    }
}

function populateDropdowns() {
    // populate wayfinder dropdown
    var wayfinderSelect = $("#wayfinder-select");
    wayfinderSelect.on('change', function (e) {
        selectedWayfinder = allWayfinders[this.value]
        fullUpdate();
    });

    for (index in allWayfinders) {
        var wayfinder = allWayfinders[index];
        wayfinderSelect.append(`<option value="${wayfinder.id}">${wayfinder.displayName}</option>`)
    }

    selectedWayfinder = allWayfinders[$("#wayfinder-select").val()];

    // populate weapon dropdown
    var weaponSelect = $("#weapon-select");
    weaponSelect.on('change', function (e) {
        selectedWeapon = allWeapons[this.value];
        fullUpdate();
    });

    for (index in allWeapons) {
        var weapon = allWeapons[index];
        weaponSelect.append(`<option value="${weapon.id}">${weapon.displayName}</option>`)
    }

    selectedWeapon = allWeapons[$("#weapon-select").val()];

    // populate accessory dropdown(s)
    for (i = 0; i < 3; i++) {
        var accessorySelect = $(`#accessory${i}-select`);

        accessorySelect.on('change', function (e) {
            switch (this.id) {
                case "accessory0-select":
                    selectedAccessories[0] = allAccessories[this.value];
                    break;                
                case "accessory1-select":
                    selectedAccessories[1] = allAccessories[this.value];
                    break;
                case "accessory2-select":
                    selectedAccessories[2] = allAccessories[this.value];
                    break;
                default:
                    break;
            }
            fullUpdate();
        });
    
        for (index in allAccessories) {
            var accessory = allAccessories[index];
            // if (selectedAccessories[(i + 1) % 3].id == index
            //     || selectedAccessories[(i + 2) % 3].id == index) {
            //     continue;
            // }
            accessorySelect.append(`<option value="${accessory.id}">${accessory.displayName}</option>`)
        }
    
        selectedAccessories[i] = allAccessories[$("#weapon-select").val()];
    }
}

function attachControls() {
    // affinity pickers
    $('#wayfinder-instinct-affinity').change(fullUpdate);
    $('#wayfinder-discipline-affinity').change(fullUpdate);
    $('#wayfinder-focus-affinity').change(fullUpdate);
    $('#weapon-instinct-affinity').change(fullUpdate);
    $('#weapon-discipline-affinity').change(fullUpdate);
    $('#weapon-focus-affinity').change(fullUpdate);

    // attributes
    $('#wayfinder-level').change(fullUpdate);
    $('#wayfinder-awakening').change(fullUpdate);
    $('#weapon-level').change(fullUpdate);
    $('#weapon-reinforcement').change(fullUpdate);
    $('#weapon-temper').change(fullUpdate);
    $(`#accessory0-level`).change(fullUpdate);
    $(`#accessory1-level`).change(fullUpdate);
    $(`#accessory2-level`).change(fullUpdate);
}

function updateWayfinderTables() {
    // attributes
    selectedWayfinder.level = $('#wayfinder-level').val() === "" ? 1 : $('#wayfinder-level').val();
    selectedWayfinder.awakening = $('#wayfinder-awakening').val() === "" ? 0 : $('#wayfinder-awakening').val();
    $('#wayfinder-at-level-label').text(`@ Level ${selectedWayfinder.level}`);

    // affinities
    selectedWayfinder.affinities[0] = $('#wayfinder-instinct-affinity').val() === "" ? 0 : $('#wayfinder-instinct-affinity').val();
    selectedWayfinder.affinities[1] = $('#wayfinder-discipline-affinity').val() === "" ? 0 : $('#wayfinder-discipline-affinity').val();
    selectedWayfinder.affinities[2] = $('#wayfinder-focus-affinity').val() === "" ? 0 : $('#wayfinder-focus-affinity').val();

    // base stats
    var baseStatsTable = $('#wayfinder-base-stats-table').children('tbody');
    baseStatsTable.empty();

    for (i = 0; i < 9; i++) {
        baseStatsTable.append(`
        <tr>
            <td>${statLabels[i]}</td>
            <td class="text-end">${selectedWayfinder.baseStats[i].toFixed(1)}</td>
        </tr>`);
    }
    baseStatsTable.append(`
        <tr>
            <td>${statLabels[9]}</td>
            <td class="text-end">${selectedWayfinder.baseStatTotal}</td>
        </tr>`);

    // internal stats
    var internalStatsTable = $('#wayfinder-internal-stats-table').children('tbody');
    internalStatsTable.empty();

    var leveledPower = selectedWayfinder.baseStatTotal + (18 * (selectedWayfinder.level + selectedWayfinder.awakening - 1));
    for (i = 0; i < 9; i++) {
        var x = selectedWayfinder.baseStats[i] / selectedWayfinder.baseStatTotal;
        selectedWayfinder.internalStats[i] =  x * leveledPower * mods.budgetMods[i] * mods.genericMods[i];
        internalStatsTable.append(`
        <tr>
            <td>x${mods.budgetMods[i]}</td>
            <td>x${mods.genericMods[i]}</td>
            <td class="text-end">${selectedWayfinder.internalStats[i].toFixed(3)}</td>
        </tr>`);
    }
    internalStatsTable.append(`
        <tr>
            <td></td>
            <td></td>
            <td class="text-end">${leveledPower}</td>
        </tr>`);
    
    // display stats
    var displayStatsTable = $('#wayfinder-display-stats-table').children('tbody');
    displayStatsTable.empty();

    for (i = 0; i < 9; i++) {
        selectedWayfinder.displayStats[i] = Math.round(selectedWayfinder.internalStats[i] * mods.displayMods[i]);
        displayStatsTable.append(`
            <tr>
                <td>x${mods.displayMods[i]}</td>
                <td class="text-end">${selectedWayfinder.displayStats[i]}</td>
            </tr>`);
    }
    displayStatsTable.append(`
        <tr>
            <td></td>
            <td class="text-end">${leveledPower}</td>
        </tr>`);

}

function updateWeaponTables() {
    // attributes
    selectedWeapon.level = $('#weapon-level').val() === "" ? 1 : $('#weapon-level').val();
    selectedWeapon.reinforcements = $('#weapon-reinforcement').val() === "" ? 0 : $('#weapon-reinforcement').val();
    selectedWeapon.temper = $('#weapon-temper').val() === "" ? 0 : $('#weapon-temper').val();
    $('#weapon-at-level-label').text(`@ Level ${selectedWayfinder.level}`);

    // affinities
    selectedWeapon.affinities[0] = $('#weapon-instinct-affinity').val() === "" ? 0 : $('#weapon-instinct-affinity').val();
    selectedWeapon.affinities[1] = $('#weapon-discipline-affinity').val() === "" ? 0 : $('#weapon-discipline-affinity').val();
    selectedWeapon.affinities[2] = $('#weapon-focus-affinity').val() === "" ? 0 : $('#weapon-focus-affinity').val();

    // base stats
    var baseStatsTable = $('#weapon-base-stats-table').children('tbody');
    baseStatsTable.empty();

    for (i = 0; i < selectedWeapon.baseStats.length; i++) {
        var baseStat = selectedWeapon.baseStats[i];
        baseStatsTable.append(`
            <tr>
                <td class="${baseStat.category}">${baseStat.type}</td>
                <td class="text-end">${baseStat.value.toFixed(1)}</td>
            </tr>`);
    }
    baseStatsTable.append(`
        <tr>
            <td>${statLabels[9]}</td>
            <td class="text-end">${selectedWeapon.baseStatTotal}</td>
        </tr>`);

    // internal stats
    var internalStatsTable = $('#weapon-internal-stats-table').children('tbody');
    internalStatsTable.empty();

    var leveledPower = selectedWeapon.baseStatTotal + (selectedWeapon.perLevelBudgetIncrease * (selectedWeapon.level - 1))
        + (selectedWeapon.perTemperBudgetIncrease * (selectedWeapon.temper))
        + (selectedWeapon.perRankBudgetIncrease * (selectedWeapon.reinforcements));

    for (i = 0; i < selectedWeapon.baseStats.length; i++) {
        var baseStat = selectedWeapon.baseStats[i];

        var totalAffinities = parseInt(selectedWayfinder.affinities[Categories[baseStat.category]]) + parseInt(selectedWeapon.affinities[Categories[baseStat.category]]);
        totalAffinities /= 100;
        
        var x = baseStat.value / selectedWeapon.baseStatTotal;       
        selectedWeapon.internalStats[i] = x * leveledPower * mods.budgetMods[Stats[baseStat.type]] * mods.genericMods[Stats[baseStat.type]];
        selectedWeapon.internalStats[i] += (selectedWeapon.internalStats[i] * totalAffinities);

        internalStatsTable.append(`
            <tr>
                <td>x${mods.budgetMods[Stats[baseStat.type]]}</td>
                <td>x${mods.genericMods[Stats[baseStat.type]]}</td>
                <td class="text-end ${baseStat.category}">${selectedWeapon.internalStats[i].toFixed(3)}</td>
            </tr>`);
    }
    internalStatsTable.append(`
        <tr>
            <td></td>
            <td></td>
            <td class="text-end">${leveledPower}</td>
        </tr>`);

    // display stats
    var displayStatsTable = $('#weapon-display-stats-table').children('tbody');
    displayStatsTable.empty();

    for (i = 0; i < selectedWeapon.baseStats.length; i++) {
        var baseStat = selectedWeapon.baseStats[i];
        selectedWeapon.displayStats[i] = Math.round(selectedWeapon.internalStats[i] * mods.displayMods[Stats[baseStat.type]]);
        displayStatsTable.append(`
            <tr>
                <td>x${mods.displayMods[Stats[baseStat.type]]}</td>
                <td class="text-end ${baseStat.category}">${(selectedWeapon.displayStats[i])}</td>
            </tr>`);
    }
    displayStatsTable.append(`
        <tr>
            <td></td>
            <td class="text-end">${leveledPower}</td>
        </tr>`);
}

function updateAccessoryTables() {
    for (j = 0; j < 3; j++) {
        var selectedAccessory = selectedAccessories[j];

        // attributes
        selectedAccessory.level = $(`#accessory${j}-level`).val() === "" ? 1 : $(`#accessory${j}-level`).val();
    
        // display stats
        var displayStatsTable = $(`#accessory${j}-display-stats-table`).children('tbody');
        displayStatsTable.empty();
    
        var leveledPower = selectedAccessory.baseStatTotal + (selectedAccessory.perLevelBudgetIncrease * (selectedAccessory.level - 1));

        for (i = 0; i < selectedAccessory.baseStats.length; i++) {
            var baseStat = selectedAccessory.baseStats[i];
    
            var totalAffinities = selectedWayfinder.affinities[Categories[baseStat.category]] / 100;
            
            var x = baseStat.value / selectedAccessory.baseStatTotal;

            selectedAccessory.internalStats[i] = x * leveledPower * mods.budgetMods[Stats[baseStat.type]] * mods.genericMods[Stats[baseStat.type]];
            selectedAccessory.internalStats[i] += (selectedAccessory.internalStats[i] * totalAffinities);

            selectedAccessory.displayStats[i] = Math.round(selectedAccessory.internalStats[i] * mods.displayMods[Stats[baseStat.type]]);
            
            displayStatsTable.append(`
                <tr>
                    <td class="${baseStat.category}">${baseStat.type}</td>
                    <td class="text-end">${(selectedAccessory.displayStats[i])}</td>
                </tr>`);
        }

        displayStatsTable.append(`
            <tr>
                <td>${statLabels[9]}</td>
                <td class="text-end">${leveledPower}</td>
            </tr>`);
    }
    
}

function updateTotals() {
    var totalsTable = $(`#total-stats-table`).children('tbody');
        totalsTable.empty();

    var totalOtherStats = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    var totalStats = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < 9; i++) {
        for (j = 0; j < 3; j++) {
            for (k in selectedAccessories[j].baseStats) {
                if (selectedAccessories[j].baseStats[k].type == statLabels[i]) {
                    totalOtherStats[i] += selectedAccessories[j].displayStats[k];
                }
            }
        }
    }

    for (i = 0; i < 9; i++) {
        // wayfinder stats
        var appendString = `<tr><td>${statLabels[i]}</td><td>${selectedWayfinder.displayStats[i]}</td>`
        totalStats[i] += selectedWayfinder.displayStats[i];

        // weapon stats
        var appended = false;
        for (j in selectedWeapon.baseStats) {
            if (selectedWeapon.baseStats[j].type == statLabels[i]) {
                appendString += `<td>${selectedWeapon.displayStats[j]}</td>`
                totalStats[i] += selectedWeapon.displayStats[j];
                appended = true;
                break;
            }
        }
        if (!appended) appendString += "<td>0</td>";

        // other stats
        appendString += `<td>${totalOtherStats[i]}</td>`;
        totalStats[i] += totalOtherStats[i];

        // total stats
        appendString += `<td class="text-end">${totalStats[i]}</td>`

        appendString += "</tr>";
        totalsTable.append(appendString);
    }
}