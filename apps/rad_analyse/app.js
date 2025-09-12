/*******************************************************************************







*******************************************************************************/

// KOMPLETTE LOG-ANZEIGE - MIT DEINER ORIGINAL-SCROLL-LOGIK

const  GMZ = 0;
const  uSv = 1;

var messwert_einheit = GMZ;




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
        rectHeight: 6,        // Rechteck-H�he
        rectColor: '#ff0000', // Rot
        posX: 1,              // X-Position (LINKER Rand)
        posY: 5               // Y-Offset (relativ zur Zeile)
    }
};

//---

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
                alert: processedLine.alert      // Alert-Flag hinzugef�gt!
            });
        }
        
        // LEERZEILEN hinzuf�gen f�r volle Seiten
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
            console.log("Leerzeilen hinzugef�gt:", emptyLinesNeeded);
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
                
                // Alert pr�fen
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
        g.drawString(progressLine, 10, 5);
        
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
/*            
            // LINKS-NACH-RECHTS = BEENDEN
            if (directionLR === 1) {
                console.log("Wischen LINKS-NACH-RECHTS = BEENDEN");
              //  self.cleanup();
              //  showAllLogsWithoutWarnings();
                return;
            }
            
*/          
            
            // LINKS-NACH-RECHTS = BEENDEN
            if (directionLR === -1) {
                console.log("---->Wischen LINKS-NACH-RECHTS = BEENDEN");
                self.cleanup();
                showAllLogsWithoutWarnings();
                return;
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
                console.log("Zurück zum Hauptmen�");
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
        
        var content = f.read(fileSize);
        var lines = content.split('\n').filter(line => line.trim() !== "");
        
        if (lines.length === 0) {
            E.showMessage("Keine Daten", "Inhalt");
            setTimeout(showAllLogsWithoutWarnings, 2000);
            return;
        }
        
        var dataLines = lines.slice(1); // Ohne Header
        var dateTitle = logDatei_name.replace("RADIATION_", "").replace(".csv", "");
        
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
  
   // Heutige Datei prüfen
    var logDatei_name = checkTodaysLogFileExists();
    if (logDatei_name) {
        console.log("Heute gefunden:", logDatei_name);
    } else {
        console.log("Heute nicht gefunden");
       logDatei_name = "RADIATION_2025-09-08.csv";
    }
  
    showLogdatei(logDatei_name);
}, 1000);




