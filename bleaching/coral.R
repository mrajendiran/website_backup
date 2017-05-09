setwd(dirname(rstudioapi::getActiveDocumentContext()$path))
suppressMessages({
  library(dplyr)
  library(reshape2)
  library(ggplot2)
  library(readr)
  library(ggthemes)
  library(caTools)
  library(purrr)
})

############## load datasets ############## 
bleaching_data   <- read.csv('data/CoralBleaching.csv', stringsAsFactors=FALSE, fileEncoding="latin1", na.strings = "")
diseases_data  <- read.csv('data/CoralDiseases.csv', stringsAsFactors=FALSE, fileEncoding="latin1")
protected_areas_data  <- read.csv('data/MarineProtectedAreas.csv', stringsAsFactors=FALSE, fileEncoding="latin1")
reef_locations_data <- read.csv('data/ReefLocations.csv', stringsAsFactors=FALSE, fileEncoding="latin1")

# change country codes to 3 characters
country_bin <- function(country_code) {
  country_code %>%
    map_chr(function(code) {
      if (grepl("AUS_GBR|AUS_NOR|AUS_WES", code)) {
        return("AUS")
      }
      if (grepl("IDN_SULA", code)) {
        return("IDN")
      }
      if (grepl("MEX_CRB|MEX_PAC", code)) {
        return("MEX")
      }
      if (grepl("MYS_BOR|MYS_PEN", code)) {
        return("MYS")
      }
      if (grepl("TZA_ZAN", code)) {
        return("ZAN")
      }
      if (grepl("UMI_BHD|UMI_PAL", code)) {
        return("UMI")
      }
      if (grepl("USA_FLO|USA_HAW", code)) {
        return("USA")
      }
      if (grepl("VIR_CRO|VIR_JOH", code)) {
        return("VIR")
      }
      if (grepl("YEM_ADE", code)) {
        return("YEM")
      }
      if (grepl("GBR_CHA", code)) {
        return("GBR")
      }
      if (grepl("PAN_ATL", code)) {
        return("PAN")
      }
      code
    })
}

# make severity codes consistent
severity_bin <- function(severity) {
  severity %>%
    map_chr(function(code) {
      if (grepl("Low", code)) {
        return("LOW")
      }
      if (grepl("Medium", code)) {
        return("MEDIUM")
      }
      if (grepl("No Bleaching", code)) {
        return("NONE")
      }
      if (grepl("Severity Unknown", code)) {
        return("UNKNOWN")
      }
      code
    })
}

# filter columns and mutate country code/severity
bleaching_data %>% 
  filter(LOCATION != "West Dog") %>% 
  select(YEAR, COUNTRY, COUNTRY_CODE, LOCATION, LAT, LON, BLEACHING_SEVERITY, REMARKS, SOURCE) %>% 
  mutate(CODE = country_bin(COUNTRY_CODE)) %>%
  mutate(SEVERITY = severity_bin(BLEACHING_SEVERITY)) %>% 
  filter(abs(LAT) < 200) %>% 
  filter(abs(LON) < 200) %>%
  select(-COUNTRY_CODE, -BLEACHING_SEVERITY) -> bleaching
# NAs: remarks (3103); location(123)

# create csvs for each year
years <- levels(bleaching$YEAR)
levels(factor(bleaching$BLEACHING_SEVERITY))


write.csv(bleaching %>% filter(grepl("196", YEAR)), "data/bleaching_data_1960.csv", row.names = FALSE)
write.csv(bleaching %>% filter(grepl("197", YEAR)), "data/bleaching_data_1970.csv", row.names = FALSE)
write.csv(bleaching %>% filter(grepl("198", YEAR)), "data/bleaching_data_1980.csv", row.names = FALSE)
write.csv(bleaching %>% filter(grepl("199", YEAR)), "data/bleaching_data_1990.csv", row.names = FALSE)
write.csv(bleaching %>% filter(grepl("200", YEAR)), "data/bleaching_data_2000.csv", row.names = FALSE)
write.csv(bleaching %>% filter(grepl("201", YEAR)), "data/bleaching_data_2010.csv", row.names = FALSE)


