$base = "http://localhost:8080/api/v1"
$loginBody = '{"username":"admin","password":"admin123"}'
$token = (Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body $loginBody).accessToken
$h = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

function P($path, $json) {
    try { $r = Invoke-RestMethod -Uri "$base$path" -Method POST -Headers $h -Body $json -ErrorAction Stop; Write-Host "[OK] $path"; return $r }
    catch { Write-Host "[FAIL] $path - $($_.Exception.Message)"; return $null }
}

function G($path) {
    try { return Invoke-RestMethod -Uri "$base$path" -Method GET -Headers $h -ErrorAction Stop }
    catch { Write-Host "[FAIL] GET $path"; return $null }
}

Write-Host "===== 1. STATUSLAR ====="
P "/statuses" '{"nameUz":"Ishlamoqda","nameRu":"Working","color":"#10b981","description":"Normal ishlayapti"}'
P "/statuses" '{"nameUz":"Tamirda","nameRu":"Repairing","color":"#f59e0b","description":"Tamirlanmoqda"}'
P "/statuses" '{"nameUz":"Buzilgan","nameRu":"Broken","color":"#ef4444","description":"Ishdan chiqqan"}'
P "/statuses" '{"nameUz":"Saqlashda","nameRu":"Storage","color":"#3b82f6","description":"Omborxonada"}'
P "/statuses" '{"nameUz":"Hisobdan chiqarilgan","nameRu":"WriteOff","color":"#6b7280","description":"Eskirgan"}'

Write-Host "===== 2. TOIFALAR ====="
P "/categories" '{"nameUz":"Kompyuterlar","nameRu":"Computers","description":"Desktop va noutbuklar"}'
P "/categories" '{"nameUz":"Printerlar","nameRu":"Printers","description":"Lazerli va rangli printerlar"}'
P "/categories" '{"nameUz":"Serverlar","nameRu":"Servers","description":"Serverlar va tarmoq jihozlari"}'
P "/categories" '{"nameUz":"Monitorlar","nameRu":"Monitors","description":"LCD va LED monitorlar"}'
P "/categories" '{"nameUz":"UPS qurilmalari","nameRu":"UPS","description":"Uzluksiz quvvat manbalari"}'
P "/categories" '{"nameUz":"Tarmoq jihozlari","nameRu":"Network","description":"Switchlar routerlar"}'

Write-Host "===== 3. ISHLAB CHIQARUVCHILAR ====="
P "/manufacturers" '{"name":"HP","country":"AQSH"}'
P "/manufacturers" '{"name":"Dell","country":"AQSH"}'
P "/manufacturers" '{"name":"Lenovo","country":"Xitoy"}'
P "/manufacturers" '{"name":"Samsung","country":"Janubiy Koreya"}'
P "/manufacturers" '{"name":"APC","country":"AQSH"}'
P "/manufacturers" '{"name":"Cisco","country":"AQSH"}'

Write-Host "===== 4. JOYLASHUVLAR ====="
P "/locations" '{"name":"Bosh ofis 1-qavat IT bolimi","building":"Bosh ofis","floor":"1","room":"101"}'
P "/locations" '{"name":"Bosh ofis 2-qavat Buxgalteriya","building":"Bosh ofis","floor":"2","room":"201"}'
P "/locations" '{"name":"Bosh ofis 3-qavat Direksiya","building":"Bosh ofis","floor":"3","room":"301"}'
P "/locations" '{"name":"Server xona","building":"Ishlab chiqarish","floor":"1","room":"S01"}'
P "/locations" '{"name":"Ombor binosi","building":"Ombor","floor":"1","room":"O01"}'

Write-Host "===== 5. MASUL SHAXSLAR ====="
P "/responsible-persons" '{"fullName":"Alisher Karimov","position":"IT bolim boshligi","phone":"+998901234567","email":"alisher@boshliq.uz"}'
P "/responsible-persons" '{"fullName":"Nilufar Saidova","position":"Tizim administratori","phone":"+998901234568","email":"nilufar@boshliq.uz"}'
P "/responsible-persons" '{"fullName":"Bobur Toshmatov","position":"Texnik muhandis","phone":"+998901234569","email":"bobur@boshliq.uz"}'
P "/responsible-persons" '{"fullName":"Dildora Raximova","position":"Ombor mudiri","phone":"+998901234570","email":"dildora@boshliq.uz"}'

Write-Host "===== 6. HUJJAT TURLARI ====="
P "/document-types" '{"nameUz":"Kafolat guvohnomasi","nameRu":"Warranty"}'
P "/document-types" '{"nameUz":"Texnik pasport","nameRu":"TechPassport"}'
P "/document-types" '{"nameUz":"Kirim hujjati","nameRu":"Income"}'
P "/document-types" '{"nameUz":"Akt","nameRu":"Act"}'

Write-Host "===== Fetching IDs ====="
$sts = G "/statuses"
$cats = G "/categories"
$mfs = G "/manufacturers"
$locs = G "/locations"
$pers = G "/responsible-persons"

if ($sts -and $cats -and $mfs -and $locs -and $pers) {
    $sw = ($sts | Where-Object { $_.nameUz -eq "Ishlamoqda" }).id
    $sr = ($sts | Where-Object { $_.nameUz -eq "Tamirda" }).id
    $sb = ($sts | Where-Object { $_.nameUz -eq "Buzilgan" }).id
    $ss = ($sts | Where-Object { $_.nameUz -eq "Saqlashda" }).id

    $cc = ($cats | Where-Object { $_.nameUz -eq "Kompyuterlar" }).id
    $cp = ($cats | Where-Object { $_.nameUz -eq "Printerlar" }).id
    $cs = ($cats | Where-Object { $_.nameUz -eq "Serverlar" }).id
    $cm = ($cats | Where-Object { $_.nameUz -eq "Monitorlar" }).id
    $cu = ($cats | Where-Object { $_.nameUz -eq "UPS qurilmalari" }).id
    $cn = ($cats | Where-Object { $_.nameUz -eq "Tarmoq jihozlari" }).id

    $mh = ($mfs | Where-Object { $_.name -eq "HP" }).id
    $md = ($mfs | Where-Object { $_.name -eq "Dell" }).id
    $ml = ($mfs | Where-Object { $_.name -eq "Lenovo" }).id
    $ms = ($mfs | Where-Object { $_.name -eq "Samsung" }).id
    $ma = ($mfs | Where-Object { $_.name -eq "APC" }).id
    $mc = ($mfs | Where-Object { $_.name -eq "Cisco" }).id

    $l1 = ($locs | Where-Object { $_.room -eq "101" }).id
    $l2 = ($locs | Where-Object { $_.room -eq "201" }).id
    $l3 = ($locs | Where-Object { $_.room -eq "301" }).id
    $ls = ($locs | Where-Object { $_.room -eq "S01" }).id
    $lo = ($locs | Where-Object { $_.room -eq "O01" }).id

    $p1 = ($pers | Where-Object { $_.fullName -like "Alisher*" }).id
    $p2 = ($pers | Where-Object { $_.fullName -like "Nilufar*" }).id
    $p3 = ($pers | Where-Object { $_.fullName -like "Bobur*" }).id

    Write-Host "IDs: Status=$sw, Cat=$cc, Mfr=$mh, Loc=$l1, Pers=$p1"

    Write-Host "===== 7. USKUNALAR ====="
    $eq1 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-001`",`"name`":`"HP ProBook 450 G10`",`"categoryId`":$cc,`"manufacturerId`":$mh,`"serialNumber`":`"SN-HP-001234`",`"statusId`":$sw,`"locationId`":$l1,`"responsiblePersonId`":$p1,`"purchaseDate`":`"2024-03-15`",`"warrantyUntil`":`"2027-03-15`",`"description`":`"IT bolim uchun noutbuk`"}"
    $eq2 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-002`",`"name`":`"Dell OptiPlex 7010`",`"categoryId`":$cc,`"manufacturerId`":$md,`"serialNumber`":`"SN-DELL-005678`",`"statusId`":$sw,`"locationId`":$l2,`"responsiblePersonId`":$p2,`"purchaseDate`":`"2024-06-20`",`"warrantyUntil`":`"2027-06-20`",`"description`":`"Buxgalteriya desktop`"}"
    $eq3 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-003`",`"name`":`"HP LaserJet Pro M404dn`",`"categoryId`":$cp,`"manufacturerId`":$mh,`"serialNumber`":`"SN-HP-009876`",`"statusId`":$sw,`"locationId`":$l2,`"responsiblePersonId`":$p2,`"purchaseDate`":`"2024-01-10`",`"warrantyUntil`":`"2026-01-10`",`"description`":`"Lazer printer buxgalteriya`"}"
    $eq4 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-004`",`"name`":`"Dell PowerEdge T40`",`"categoryId`":$cs,`"manufacturerId`":$md,`"serialNumber`":`"SN-DELL-112233`",`"statusId`":$sw,`"locationId`":$ls,`"responsiblePersonId`":$p1,`"purchaseDate`":`"2023-09-01`",`"warrantyUntil`":`"2026-09-01`",`"description`":`"Lokal server`"}"
    $eq5 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-005`",`"name`":`"Lenovo ThinkPad T14`",`"categoryId`":$cc,`"manufacturerId`":$ml,`"serialNumber`":`"SN-LEN-445566`",`"statusId`":$sr,`"locationId`":$l3,`"responsiblePersonId`":$p3,`"purchaseDate`":`"2024-04-01`",`"warrantyUntil`":`"2027-04-01`",`"description`":`"Direktor noutbuki tamirda`"}"
    $eq6 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-006`",`"name`":`"Samsung 27 4K Monitor`",`"categoryId`":$cm,`"manufacturerId`":$ms,`"serialNumber`":`"SN-SAM-778899`",`"statusId`":$sw,`"locationId`":$l1,`"responsiblePersonId`":$p1,`"purchaseDate`":`"2024-07-15`",`"warrantyUntil`":`"2027-07-15`",`"description`":`"IT bolim 4K monitor`"}"
    $eq7 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-007`",`"name`":`"APC Smart-UPS 1500VA`",`"categoryId`":$cu,`"manufacturerId`":$ma,`"serialNumber`":`"SN-APC-334455`",`"statusId`":$sw,`"locationId`":$ls,`"responsiblePersonId`":$p1,`"purchaseDate`":`"2023-11-20`",`"warrantyUntil`":`"2026-11-20`",`"description`":`"Server xonasi UPS`"}"
    $eq8 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-008`",`"name`":`"Cisco Catalyst 2960`",`"categoryId`":$cn,`"manufacturerId`":$mc,`"serialNumber`":`"SN-CISCO-667788`",`"statusId`":$sb,`"locationId`":$ls,`"responsiblePersonId`":$p3,`"purchaseDate`":`"2022-05-10`",`"warrantyUntil`":`"2025-05-10`",`"description`":`"Tarmoq switch buzilgan`"}"
    $eq9 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-009`",`"name`":`"HP ProDesk 400 G7`",`"categoryId`":$cc,`"manufacturerId`":$mh,`"serialNumber`":`"SN-HP-556677`",`"statusId`":$ss,`"locationId`":$lo,`"responsiblePersonId`":$p2,`"purchaseDate`":`"2023-02-28`",`"warrantyUntil`":`"2026-02-28`",`"description`":`"Zaxira kompyuter saqlashda`"}"
    $eq10 = P "/equipment" "{`"inventoryNumber`":`"INV-2025-010`",`"name`":`"Lenovo ThinkVision T24i`",`"categoryId`":$cm,`"manufacturerId`":$ml,`"serialNumber`":`"SN-LEN-889900`",`"statusId`":$sw,`"locationId`":$l2,`"responsiblePersonId`":$p2,`"purchaseDate`":`"2024-09-01`",`"warrantyUntil`":`"2027-09-01`",`"description`":`"Buxgalteriya monitori`"}"
} else {
    Write-Host "Reference data fetch failed, skipping equipment"
}

Write-Host "===== 8. EHTIYOT QISMLAR ====="
P "/spare-parts" '{"name":"HP Toner 58A CF258A","code":"SP-001","unitOfMeasure":"PIECE","category":"Toner","price":450000,"minStock":5}'
P "/spare-parts" '{"name":"Dell 256GB SSD","code":"SP-002","unitOfMeasure":"PIECE","category":"Disk","price":680000,"minStock":3}'
P "/spare-parts" '{"name":"DDR4 8GB RAM","code":"SP-003","unitOfMeasure":"PIECE","category":"Xotira","price":320000,"minStock":5}'
P "/spare-parts" '{"name":"CAT6 Kabel 100m","code":"SP-004","unitOfMeasure":"METER","category":"Kabel","price":95000,"minStock":200}'
P "/spare-parts" '{"name":"RJ-45 Konnektori 100 dona","code":"SP-005","unitOfMeasure":"PACK","category":"Konnektorlar","price":45000,"minStock":10}'
P "/spare-parts" '{"name":"APC Batareya RBC7","code":"SP-006","unitOfMeasure":"PIECE","category":"Batareya","price":1200000,"minStock":2}'
P "/spare-parts" '{"name":"HP 305A Color Toner Set","code":"SP-007","unitOfMeasure":"SET","category":"Toner","price":950000,"minStock":2}'
P "/spare-parts" '{"name":"Termopasta MX-4 4g","code":"SP-008","unitOfMeasure":"PIECE","category":"Xizmat materiallari","price":85000,"minStock":5}'

Write-Host "===== 9. PPR TURLARI ====="
P "/ppr-types" '{"name":"Profilaktik tozalash","description":"Kompyuter va jihozlarni changdan tozalash","estimatedDurationMinutes":30}'
P "/ppr-types" '{"name":"Dasturiy taminot yangilash","description":"OS va drayverlarni yangilash","estimatedDurationMinutes":60}'
P "/ppr-types" '{"name":"Texnik korik","description":"Jihozlarning umumiy holatini tekshirish","estimatedDurationMinutes":45}'
P "/ppr-types" '{"name":"UPS batareya tekshiruvi","description":"UPS batareyasini tekshirish va kalibratsiya","estimatedDurationMinutes":30}'
P "/ppr-types" '{"name":"Server profilaktikasi","description":"Server jihozlarini tozalash va tekshirish","estimatedDurationMinutes":120}'

Write-Host "===== 10. FOYDALANUVCHILAR ====="
P "/users" '{"username":"operator1","password":"operator123","fullName":"Alisher Karimov","email":"alisher@boshliq.uz","phone":"+998901234567","role":"OPERATOR","language":"UZ"}'
P "/users" '{"username":"viewer1","password":"viewer12345","fullName":"Nilufar Saidova","email":"nilufar@boshliq.uz","phone":"+998901234568","role":"VIEWER","language":"UZ"}'

Write-Host "===== 11. ARIZALAR ====="
P "/requests" '{"title":"Yangi printer kerak","description":"Buxgalteriya bolimiga yangi lazer printer kerak. Hozirgi eski printer juda sekin ishlayapti.","priority":"HIGH"}'
P "/requests" '{"title":"Kompyuter yangilash sorovi","description":"IT bolim uchun 3 ta yangi kompyuter kerak. Hozirgi kompyuterlar 5 yildan ortiq ishlagan.","priority":"MEDIUM"}'
P "/requests" '{"title":"Monitor almashtirilsin","description":"201-xonadagi monitor yoqilmayapti. Yangi monitor bilan almashtirish kerak.","priority":"LOW"}'

Write-Host "===== 12. PPR VAZIFALAR ====="
$allPT = G "/ppr-types"
$allEq = G "/equipment"
if ($allPT -and $allEq) {
    $ptId1 = if ($allPT -is [array]) { $allPT[0].id } else { $allPT.id }
    $ptId2 = if ($allPT -is [array] -and $allPT.Count -gt 1) { $allPT[1].id } else { $ptId1 }
    $ptId3 = if ($allPT -is [array] -and $allPT.Count -gt 2) { $allPT[2].id } else { $ptId1 }

    $eqContent = $allEq.content
    if (-not $eqContent) { $eqContent = $allEq }
    if ($eqContent -is [array] -and $eqContent.Count -ge 4) {
        $eId1 = $eqContent[0].id
        $eId2 = $eqContent[1].id
        $eId3 = $eqContent[2].id
        $eId4 = $eqContent[3].id
        
        P "/ppr/tasks" "{`"equipmentId`":$eId1,`"pprTypeId`":$ptId1,`"scheduledDate`":`"2026-05-25`",`"assignedTo`":`"Alisher Karimov`",`"priority`":`"MEDIUM`",`"description`":`"Noutbukni tozalash va termopasta tekshirish`"}"
        P "/ppr/tasks" "{`"equipmentId`":$eId4,`"pprTypeId`":$ptId3,`"scheduledDate`":`"2026-05-22`",`"assignedTo`":`"Bobur Toshmatov`",`"priority`":`"HIGH`",`"description`":`"Server holatini tekshirish`"}"
        P "/ppr/tasks" "{`"equipmentId`":$eId2,`"pprTypeId`":$ptId2,`"scheduledDate`":`"2026-06-01`",`"assignedTo`":`"Nilufar Saidova`",`"priority`":`"LOW`",`"description`":`"Windows va Office yangilash`"}"
        P "/ppr/tasks" "{`"equipmentId`":$eId3,`"pprTypeId`":$ptId1,`"scheduledDate`":`"2026-05-18`",`"assignedTo`":`"Alisher Karimov`",`"priority`":`"CRITICAL`",`"description`":`"Printer tozalash - muddati otgan`"}"
    }
}

Write-Host ""
Write-Host "===== TEKSHIRISH ====="
$stCount = (G "/statuses")
if ($stCount) { Write-Host "Statuslar: $($stCount.Count)" }
$ctCount = (G "/categories")
if ($ctCount) { Write-Host "Toifalar: $($ctCount.Count)" }
$mfCount = (G "/manufacturers")
if ($mfCount) { Write-Host "Ishlab chiqaruvchilar: $($mfCount.Count)" }
$lcCount = (G "/locations")
if ($lcCount) { Write-Host "Joylashuvlar: $($lcCount.Count)" }
$prCount = (G "/responsible-persons")
if ($prCount) { Write-Host "Masul shaxslar: $($prCount.Count)" }
$eqAll = G "/equipment"
if ($eqAll) { Write-Host "Uskunalar: $($eqAll.totalElements)" }
$usAll = (G "/users")
if ($usAll) { Write-Host "Foydalanuvchilar: $($usAll.Count)" }

Write-Host ""
Write-Host "===== TAYYOR! Barcha test malumotlari qoshildi! ====="
