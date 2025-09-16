/*******************************************************************************







*******************************************************************************/

// KOMPLETTE LOG-ANZEIGE - MIT DEINER ORIGINAL-SCROLL-LOGIK

const BLACK  =  '#000000' ;
const GREEN  =  '#00ff00' ;
const YELLOW =  '#ffff00' ;
const RED    =  '#ff0000' ;
const BLUE   =  '#0000ff' ; 
const WHITE  =  '#ffffff' ;


const  GMZ = 0;
const  uSv = 1;

var messwert_einheit = GMZ;
var alert_vorhanden  = false;

// === DATEI-LISTE FÜR NAVIGATION ===

// GLOBALE VARIABLE für Datei-Liste
var GLOBAL_FILE_LIST = {
    files: [],                      // Sortierte Dateinamen
    count: 0,                       // Anzahl Dateien
    index:0,                        // Index der aktuellen Logdatei
    dateiname:"RADIATION_LIST.txt"  // hier stehen die Dateinamen der gespeicherten Log Datein
};



// === GLOBALE EINSTELLUNGEN ===
var GLOBAL_SETTINGS = {
    GREEN_GRENZWERT: 30,
    YELLOW_GRENZWERT: 50,
    
    FONT_SIZES: {
        title: 16,
        subtitle: 18,
        header: 18,
         messwerte:24,
        info: 14,
        small: 12
    },
    
    // FESTER ABSTAND zwischen den Zeilen
    LINE_SPACING: 24,
    
    // ALERT-EINSTELLUNGEN - VOLL KONFIGURIERBAR!
    ALERT_SETTINGS: {
        grenzwert: 35,        // Dein Grenzwert
        rectWidth: 6,         // Rechteck-Breite
        rectHeight: 6,        // Rechteck-Höhe
        rectColor: '#ff0000', // Rot
        posX: 1,              // X-Position (LINKER Rand)
        posY: 5               // Y-Offset (relativ zur Zeile)
    }
};

//---




// Funktion für horizontal zentrierten Text
function drawCenteredText(text, yPosition, fontSize) {
    try {
        console.log("=== ZENTRIERTE TEXT-POSITIONIERUNG ===");
        console.log("Text:", text);
        console.log("Y-Position:", yPosition);
        console.log("Schriftgröße:", fontSize);
        
        // 1. Text-Breite berechnen
        g.setFont("Vector", fontSize);
        var textWidth = g.stringWidth(text);
        console.log("Text-Breite:", textWidth);
        
        // 2. Display-Breite (176 Pixel)
        var displayWidth = 176;
        console.log("Display-Breite:", displayWidth);
        
        // 3. Zentrale X-Position berechnen
        var centeredX = (displayWidth - textWidth) / 2;
        console.log("Zentrale X-Position:", centeredX);
        
        // 4. Text zentriert zeichnen
        g.drawString(text, centeredX, yPosition);
        g.flip();
        
        console.log("✅ Text zentriert gezeichnet!");
        return centeredX; // Rückgabe der X-Position
        
    } catch (e) {
        console.log("❌ Fehler bei Zentrierung:", e.message);
        return 0;
    }
}

//-----





//-----
function loadFileList(filename) {
    try {
        console.log("=== LADE DATEILISTE OHNE JSON ===");
        
        // MIT OPEN lesen
        var f = require("Storage").open(filename, "r");
        var fileSize = f.getLength();
        
        if (fileSize === 0) {
            console.log("❌ Leere Cache-Datei");
            GLOBAL_FILE_LIST.files = [];
            GLOBAL_FILE_LIST.count = 0;
            return false;
        }
        
        var content = f.read(fileSize);
        if (!content) {
            console.log("❌ Kein Inhalt");
            GLOBAL_FILE_LIST.files = [];
            GLOBAL_FILE_LIST.count = 0;
            return false;
        }
        
        // ZEILENWEISE aufteilen
        var lines = content.split('\n').filter(line => line.trim() !== "");
        
        // Globale Liste füllen
        GLOBAL_FILE_LIST.files = lines;
        GLOBAL_FILE_LIST.count = lines.length;
        
        console.log("✅ Dateiliste geladen!");
        console.log("Anzahl Einträge:", GLOBAL_FILE_LIST.count);
        return true;
        
    } catch (e) {
        console.log("❌ Fehler beim Laden:", e.message);
        GLOBAL_FILE_LIST.files = [];
        GLOBAL_FILE_LIST.count = 0;
        return false;
    }
}

//------------












// === ROUTINE 1: Dateinamen in Liste eintragen (neueste oben) ===
function populateFileList() {
    try {
        console.log("=== POPULATE FILE LIST ===");
        
        // Alle Dateien auflisten
        var allFiles = require("Storage").list();
        var radiationFiles = [];
        
        // Nur RADIATION_*.csv Dateien sammeln MIT Bereinigung
        for (var i = 0; i < allFiles.length; i++) {
            var filename = allFiles[i];
            if (typeof filename === 'string') {
                // STEUERZEICHEN BEREINIGEN
                var cleanName = "";
                for (var j = 0; j < filename.length; j++) {
                    var charCode = filename.charCodeAt(j);
                    if (charCode >= 32 && charCode <= 126) {
                        cleanName += filename.charAt(j);
                    }
                }
                
                if (cleanName.startsWith("RADIATION_") && cleanName.endsWith(".csv")) {
                    radiationFiles.push(cleanName);
                }
            }
        }
        
        // Sortieren: neueste zuerst
        radiationFiles.sort().reverse();
        
        // Globale Liste füllen
        GLOBAL_FILE_LIST.files = radiationFiles;
        GLOBAL_FILE_LIST.count = radiationFiles.length;
        
        console.log("Gefundene Dateien:", GLOBAL_FILE_LIST.count);
        return GLOBAL_FILE_LIST.count;
        
    } catch (e) {
        console.log("Fehler beim Populate:", e.message);
        GLOBAL_FILE_LIST.files = [];  // ✅ IN SCOPE!
        GLOBAL_FILE_LIST.count = 0;   // ✅ IN SCOPE!
        return 0;
    }
}

// === ROUTINE 2: Dateiname durch Index abrufen ===
function getFilenameByIndex(index) {
    try {
        console.log("=== GET FILENAME BY INDEX ===");
        console.log("Index:", index, "Max:", GLOBAL_FILE_LIST.count - 1);
        
        if (index >= 0 && index < GLOBAL_FILE_LIST.count) {
            var filename = GLOBAL_FILE_LIST.files[index];
            console.log("Gefundener Dateiname:", filename);
            return filename;
        } else {
            console.log("Index außerhalb Bereich:", index);
            return null;
        }
        
    } catch (e) {
        console.log("Fehler beim Get Filename:", e.message);
        return null;
    }
}

// === TEST DER ROUTINEN ===
function testFileNavigation() {
    console.log("=== TEST DATEI-NAVIGATION ===");
    
    // Liste füllen
    var fileCount = populateFileList();
    console.log("Anzahl Dateien:", fileCount);
    
    // Erste 3 Dateien anzeigen
    for (var i = 0; i < Math.min(3, fileCount); i++) {
        var filename = getFilenameByIndex(i);
        if (filename) {
            console.log("Datei " + i + ":", filename);
        }
    }
    
    // Letzte Datei anzeigen
    if (fileCount > 0) {
        var lastFilename = getFilenameByIndex(fileCount - 1);
        console.log("Letzte Datei:", lastFilename);
    }
}




// === HEUTIGE LOG-DATEI PRÜFEN OHNE BEREINIGUNG ===
function checkTodaysLogFileExists() {
    try {
        // Heutiges Datum im Format YYYY-MM-DD
        var today = new Date();
        var year = today.getFullYear();
        var month = (today.getMonth() + 1).toString().padStart(2, '0');
        var day = today.getDate().toString().padStart(2, '0');
        
        // Dateiname für heute
        var todaysFilename = "RADIATION_" + year + "-" + month + "-" + day + ".csv";
        console.log("Prüfe heutige Datei:", todaysFilename);
        
        // DIREKT PRÜFEN ob Datei existiert
        var f = require("Storage").open(todaysFilename, "r");
        var fileSize = f.getLength();
        
        if (fileSize > 0) {
            console.log("Heutige Datei existiert! Groessee:", fileSize, "Bytes");
            return todaysFilename;
        } else {
            console.log("Heutige Datei existiert nicht oder ist leer");
            return null;
        }
        
    } catch (e) {
        console.log("Heutige Datei nicht gefunden:", e.message);
        return null;
    }
}

//---------------------------------------------------------------------------

// === STRING-PARSING FÜR ZEIT UND CPM ===

function extractTimeAndCPM(text) {
    try {
        // Text trimmen (Leerzeichen am Anfang/Ende entfernen)
        var trimmedText = text.trim();
        
        // Text an LEERZEICHEN trennen
        var parts = trimmedText.split(/\s+/); // Mehrere Leerzeichen als Trenner
        
        if (parts.length >= 2) {
            var timeStr = parts[0];  // Erstes Element = Zeit
            var cpmStr = parts[1];   // Zweites Element = CPM
            
            // CPM in Integer umwandeln
            var cpmInt = parseInt(cpmStr) || 0;
            
            //console.log("Zeit:", timeStr);
            //console.log("CPM:", cpmInt);
            
            return {
                time: timeStr,    // "23:00"
                cpm: cpmInt       // 34 (als Integer)
            };
        }
    } catch (e) {
        console.log("Parsing Fehler:", e);
    }
    
    // Fallback
    return {
        time: "00:00",
        cpm: 0
    };
}


//---------
function hasAlertValues(dataLines) {
    try {
        // Jede Zeile prüfen
        for (var i = 0; i < dataLines.length; i++) {
            var line = dataLines[i];
            
            // Zeile parsen
            var parts = line.split(',');
            if (parts.length >= 2) {
                var cpmPart = parts[1].trim();
                var cpmValue = parseInt(cpmPart) || 0;
                
                // Prüfen ob Grenzwert überschritten
                if (cpmValue > GLOBAL_SETTINGS.ALERT_SETTINGS.grenzwert) {
                    return true; // SOFORTIGE Rückgabe bei erstem Alert!
                }
            }
        }
        
        // Keine Alert-Werte gefunden
        return false;
        
    } catch (e) {
        // Bei Fehler: Keine Alert-Werte annehmen
        return false;
    }
}





//----------

// === CUSTOM SCROLL-VIEW MIT DEINER ORIGINAL-LOGIK UND ALERTS ===
var CustomScrollView = {
    items: [],
    currentIndex: 0,
    fontSize: 24,
    lineHeight: 24,
    visibleLines: 7,
    startY: 0,
    fixedDate: "",
    measurementCount: 0,
    
    // Initialisierung
    init: function(title, dataLines) {
        console.log("=== DEINE ORIGINAL-LOGIK Init ===");
        
        this.items = [];
        this.currentIndex = 0;
        this.fixedDate = title;
        this.measurementCount = dataLines.length;
        
        // Datenzeilen MIT Alerts
        for (var i = 0; i < dataLines.length; i++) {
            var processedLine = this.processLineWithAlert(dataLines[i]);
            this.items.push({
                type: "data",
                text: processedLine.text,
                fontSize: GLOBAL_SETTINGS.FONT_SIZES.messwerte,
                alert: processedLine.alert      // Alert-Flag hinzugefügt!
            });
        }
        
        // LEERZEILEN hinzufügen für volle Seiten
        var itemsPerPage = 5; // 5 Datenzeilen pro Seite
        var remainder = this.items.length % itemsPerPage;
        
        if (remainder !== 0) {
            var emptyLinesNeeded = itemsPerPage - remainder;
            for (var j = 0; j < emptyLinesNeeded; j++) {
                this.items.push({
                    type: "empty",
                    text: "",  // Leere Zeile
                    fontSize: GLOBAL_SETTINGS.FONT_SIZES.small,
                    alert: false  // Kein Alert bei Leerzeilen
                });
            }
            console.log("Leerzeilen hinzugefügt:", emptyLinesNeeded);
        }
        
        console.log("Gesamt Items:", this.items.length);
        this.display();
        this.setupSwipeScrolling();
    },
    
    // LINIE MIT Alert-Information verarbeiten
    processLineWithAlert: function(line) {
        try {
            var parts = line.split(',');
            
            if (parts.length >= 2) {
                var timePart = parts[0].trim();
                var cpmPart = parts[1].trim();
                var cpmValue = parseInt(cpmPart) || 0;
                
                // Alert prüfen
                var hasAlert = cpmValue > GLOBAL_SETTINGS.ALERT_SETTINGS.grenzwert;
                
                if (timePart && timePart.includes(':')) {
                    var timeComponents = timePart.split(':');
                    
                    // HH:MM:SS -> HH:MM
                    if (timeComponents.length === 3) {
                        var timeWithoutSeconds = timeComponents[0] + ":" + timeComponents[1];
                        return {
                            text: timeWithoutSeconds + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                    // HH:MM -> bleibt
                    else if (timeComponents.length === 2) {
                        return {
                            text: timePart + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                    // Andere -> Standard
                    else {
                        return {
                            text: timePart + "   " + cpmPart,
                            alert: hasAlert  // Alert-Flag setzen
                        };
                    }
                }
            }
        } catch (e) {
            // ignore
        }
        
        return {
            text: line,
            alert: false  // Kein Alert bei Fehler
        };
    },
    
    // Anzeige MIT Alerts
    display: function() {
        console.log("=== DEINE ORIGINAL-ANZEIGE MIT ALERTS ===");
        console.log("Aktueller Index:", this.currentIndex);
        
        g.clear();
        g.setColor('#ffffff');
        g.fillRect(0, 0, 176, 176);
        g.setColor('#000000');
        
        // ERSTE ZEILE: Datum + Fortschritt
        var totalItems = this.measurementCount;
        var currentItem = this.currentIndex + 1;
        var progressLine = this.fixedDate + " (" + currentItem + "/" + totalItems + ")";
        
        g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.title);
       
// vati      
        g.drawString(progressLine, 10, 5);   // zeichnet die erste Zeile, hier muß das rote Rechteckgesetzt werden
       
     // alert_vorhanden = false;

      
      if (alert_vorhanden === true)
        {
         
          g.setColor(GLOBAL_SETTINGS.ALERT_SETTINGS.rectColor);
          g.fillRect( 1,8, 1 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                           8 + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight); // Höhe
          g.setColor('#000000');                                           // Zurück zu Schwarz         
        }
      
     
      
        // Trennlinie
        g.drawLine(0, 25, 176, 25);
        
        // Überschrift
        g.setFont("Vector", GLOBAL_SETTINGS.FONT_SIZES.header);
        
      
      
        //g.drawString("  Zeit  CPM  µSv/h", 10, 35);
      
      
        if (messwert_einheit === GMZ)
        {
          g.drawString("  Zeit     CPM  ", 10, 35);
        }
        else
        {
          g.drawString("  Zeit    µSv/h", 10, 35);
        }
       
      
      
        // DATENZEILEN MIT Alerts
        var startY = 60;
        var itemsPerPage = 5; // 5 Zeilen pro Seite
        console.log("Zeige", itemsPerPage, "Zeilen");
        
        for (var i = 0; i < itemsPerPage; i++) {
            var itemIndex = this.currentIndex + i;
            if (itemIndex < this.items.length) {
                var item = this.items[itemIndex];
                var y = startY + (i * GLOBAL_SETTINGS.LINE_SPACING);
                
                g.setFont("Vector", item.fontSize);
                if (item.text !== "") {  // Nur nicht-leere Zeilen anzeigen                 
//Vati           
//                console.log(item.text+ "\n");  
                  
                 var result = extractTimeAndCPM(item.text);
//               console.log("Ergebnis:", JSON.stringify(result));
                 var cpm  =   result.cpm ;        
                 var zeit =   result.time ;                        
                
                  
                var x=10;
                
                g.drawString(zeit, x, y);
                  
                  x = 140;
    
//********************* TEST Formatierung testen ***********************                  
                  
                  
/*                  
                  
                if (i===1)
                {
                
                  cpm=999;
                }
                 
                  if (i===2)
                {
                
                  cpm=9999;
                }
                 
                  if (i===4)
                {
                
                  cpm=99999;
                }
                  
*/                  
                  
                 var zeile = zeit+"    "+cpm;   // 2 stellige Anzeige
                 
                 if (cpm > 99 && cpm < 1000)
                 {
                   x= x- 16;
                   zeile = zeit+"   "+cpm;     // 3 stellige Anzeige
                 }
                 else if (cpm > 999 && cpm < 10000)
                 {
                    x= x-32;
                    zeile = zeit+"  "+cpm;     // 4 stellige Anzeige
             
                 }
                 else if ( cpm>9999 && cpm < 100000)
                 {
                   x=x-45;
                 
                 }
                  
                  if (cpm >35)
                  {
                  
                  g.setColor('#ff0000');
                  }
                  
                    
                  
                  g.drawString(cpm, x, y);
                  
                  g.setColor('#000000');
                  
                  
//                g.drawString(item.text, 10, y);
               
                  //g.drawString(zeile, 10, y);
                 
//                  console.log(zeile + "\n");  
                  
             //    console.log(item.text+ "\n");                 
               
                  
                }
                
                // ALERT-RECHTECK zeichnen wenn nötig
                if (item.alert === true) {
                    g.setColor(GLOBAL_SETTINGS.ALERT_SETTINGS.rectColor);
                    
                    // KONFIGURIERBARE Position:
                    var rectX = GLOBAL_SETTINGS.ALERT_SETTINGS.posX;  // LINKER Rand
                    var rectY = y + GLOBAL_SETTINGS.ALERT_SETTINGS.posY; // Mitte der Zeile
                    
                    g.fillRect(
                        rectX, 
                        rectY,
                        rectX + GLOBAL_SETTINGS.ALERT_SETTINGS.rectWidth,   // Breite
                        rectY + GLOBAL_SETTINGS.ALERT_SETTINGS.rectHeight   // Höhe
                    );
                    g.setColor('#000000'); // Zurück zu Schwarz
                }
            }
        }
        
        g.flip();
    },
    
    // DEINE ORIGINAL SCROLLING-LOGIK - UNVERÄNDERT!
    setupSwipeScrolling: function() {
        console.log("=== Setup DEINE ORIGINAL SCROLLING-LOGIK ===");
        
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
        
        var self = this;
        
        Bangle.on('swipe', function(directionLR, directionUD) {
            console.log("=== SWIPE erkannt ===");
            console.log("LR:", directionLR, "UD:", directionUD);
           if (directionLR === 1) 
           {
            
              if (GLOBAL_FILE_LIST.index > 0)
              {  
                 GLOBAL_FILE_LIST.index--;
              
                 var logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];               
                 console.log("-------->Name :",logDatei_name);
              
                 g.clear();
                 
                 var b = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
                  
 
                
                 drawCenteredText(b, 16, 25);
                
                 drawCenteredText(GLOBAL_FILE_LIST.index + 1 +"/" + GLOBAL_FILE_LIST.count, 70, 38);

                 showLogdatei(logDatei_name);
               }
          
            }
/*            
            // LINKS-NACH-RECHTS = BEENDEN
            if (directionLR === 1) {
                console.log("Wischen LINKS-NACH-RECHTS = BEENDEN");
              //  self.cleanup();
              //  showAllLogsWithoutWarnings();
                return;
            }
            
*/          
            
            // LINKS-NACH-RECHTS  am Ende der Liste = BEENDEN
            if (directionLR === -1) 
            {
                console.log("---->Wischen RECHTS-NACH-LINKS ");
                if (GLOBAL_FILE_LIST.index < GLOBAL_FILE_LIST.count -1 )
                {
                   GLOBAL_FILE_LIST.index ++;
                   var logDatei = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];  
                   console.log("-------->Name :",logDatei);
              
                   g.clear();
              
                  
                   var a = logDatei.replace("RADIATION_", "").replace(".csv", "");
                  
                  
                   drawCenteredText(a , 16, 25);
 
                   drawCenteredText(GLOBAL_FILE_LIST.index + 1 +"/" + GLOBAL_FILE_LIST.count, 70, 38);
 
                   showLogdatei(logDatei);
                }
                else
                {
                   self.cleanup();
                   showAllLogsWithoutWarnings();
                   return;
                }
              
            }
            
          
          
          
          
          
            // NACH OBEN = seitenweise runter scrollen
            if (directionUD === -1) {
                console.log("Wischen NACH OBEN = seitenweise runter scrollen");
                
                //var pageSize = self.visibleLines - 1; // Eine Zeile �berlappung
                //var maxIndex = Math.max(0, self.items.length - self.visibleLines);
                
                //var newIndex = self.currentIndex + pageSize;
                
				        var itemsPerPage = 5; // 5 Zeilen pro Seite
                var maxIndex = Math.max(0, self.items.length - itemsPerPage);
                var newIndex = self.currentIndex + itemsPerPage;

				if (newIndex <= maxIndex) {
                    self.currentIndex = newIndex;
                    console.log("Neuer Index:", self.currentIndex);
                    self.display();
                } else {
                    // Letzte Seite
                    self.currentIndex = maxIndex;
                    console.log("Letzte Seite:", self.currentIndex);
                    self.display();
                }
            }
            // NACH UNTEN = seitenweise hoch scrollen (DEINE LOGIK!)
            else if (directionUD === 1) {
                console.log("Wischen NACH UNTEN = seitenweise hoch scrollen");
                
                //var pageSize = self.visibleLines - 1; // Eine Zeile �berlappung
                
                //var newIndex = self.currentIndex - pageSize;  // DEINE Logik!
				
				          var itemsPerPage = 5; // 5 Zeilen pro Seite
                  var newIndex = self.currentIndex - itemsPerPage;
				 
                if (newIndex >= 0) {
                    self.currentIndex = newIndex;
                    console.log("Neuer Index:", self.currentIndex);
                    self.display();
                } else {
                    // Erste Seite - DEINE Logik!
                    self.currentIndex = 0;
                    console.log("Erste Seite:", self.currentIndex);
                    self.display();
                }
            }
        });
        
        // TOUCH für Zurück
        Bangle.on('touch', function(button, xy) {
            console.log("=== Touch erkannt ===");
            console.log("Y:", xy.y);
            
            // Ganz unten = zurück
            if (xy.y > 160) {
                console.log("Zurück zum Hauptmenue");
                self.cleanup();
                showAllLogsWithoutWarnings();
            }
        });
    },

  
     // Aufräumen
    cleanup: function() {
        console.log("=== Cleanup ===");
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
    }
}; 
   

// === LOG-DATEI ANZEIGEN ===
function showLogdatei(logDatei_name) {
    try {
        console.log("Öffne Log-Datei:", logDatei_name);
        
        var f = require("Storage").open(logDatei_name, "r");
        var fileSize = f.getLength();
        
        if (fileSize === 0) {
            E.showMessage("Leere Datei", "Inhalt");
            setTimeout(showAllLogsWithoutWarnings, 2000);
            return;
        }
        
        var content = f.read(fileSize);   // hier wird das gesamte File eingelesen
      
// Vati      
      
      
        var lines = content.split('\n').filter(line => line.trim() !== "");
        
        if (lines.length === 0) {
            E.showMessage("Keine Daten", "Inhalt");
            setTimeout(showAllLogsWithoutWarnings, 2000);
            return;
        }
        
        var dataLines = lines.slice(1); // Ohne Header
        var dateTitle = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
        
//        log(dataLines); //"03:22:29,31",
                        // "14:33:26,57"    
       
       // this.alert_vorhanden = hasAlertValues(dataLines);
      
 //       log( "--->Alarme vorhanden : ",this.alert_vorhanden);
           
          alert_vorhanden = hasAlertValues(dataLines);
      
         console.log( "--->Alarme vorhanden : ",alert_vorhanden);
      
      
      
      
        CustomScrollView.init(dateTitle, dataLines);
      
      
      
      
      
        
    } catch (e) {
        E.showMessage("Fehler: " + e.message, "Lesen");
        setTimeout(showAllLogsWithoutWarnings, 2000);
    }
}

// === HAUPTMENu ===
function showAllLogsWithoutWarnings() {
     g.clear();
  console.log("**********Zurück zum Hauptmenue***************");
     // Hier kommt dein Hauptmenue-Code
 // Bangle.showLauncher();
  
  try {
        console.log("=== VERLASSE Messwert-App ===");
        
        // Aufräumen
        Bangle.removeAllListeners('swipe');
        Bangle.removeAllListeners('touch');
        g.clear();
        
        // Direkt zur Auswertungs-App
        load("radiation.app.js"); // Deine Auswertungs-App
        
    } catch (e) {
        console.log("Fehler beim Wechsel:", e.message);
        Bangle.showLauncher(); // Fallback
    }
  
  
  
}

// === TEST MIT ALERTS ===
setTimeout(function() {
    console.log("=== START ALERTS TEST ===");
    
//    var logDatei_name = "RADIATION_2025-09-08.csv";
/*  
   // Heutige Datei prüfen
    var logDatei_name = checkTodaysLogFileExists();
    if (logDatei_name) {
        console.log("Heute gefunden:", logDatei_name);
    } else {
        console.log("Heute nicht gefunden");
       logDatei_name = "RADIATION_2025-09-08.csv";
    }
*/
      
// DATEI Liste füllen
    
  var startTime = Date.now();
  
//   var fileCount = populateFileList();
    GLOBAL_FILE_LIST.count=0; 
    
   var filename =  GLOBAL_FILE_LIST.dateiname;

		var rueckwert = loadFileList(filename);
    
      if (rueckwert === false)
		{
		   console.log("Datei nicht vorhanden :", filename);
       
      showAllLogsWithoutWarnings();  // zurück ins Scanprogramm
       
		}
		else
		{
		   console.log("1.Element",GLOBAL_FILE_LIST.files[0] );
       console.log(filename , "gelesen" ,GLOBAL_FILE_LIST.count , "Elemente");
		}
  
   var endTime = Date.now();
   var executionTime = endTime - startTime;
      executionTime = executionTime.toFixed(0);
      console.log("Ausführungszeit Dateiensuche:",executionTime, "ms");   
  GLOBAL_FILE_LIST.index = GLOBAL_FILE_LIST.count-1;
     //console.log("-------->Name :",);
    logDatei_name = GLOBAL_FILE_LIST.files[GLOBAL_FILE_LIST.index];  
   // logDatei_name=GLOBAL_FILE_LIST.files[0];
     
  console.log("-------->Name :",logDatei_name);
  showLogdatei(logDatei_name);
  
    
  
}, 1000);



