!macro customInstall
  DetailPrint "Register chipi URI Handler"
  DeleteRegKey HKCR "chipi"
  WriteRegStr HKCR "chipi" "" "URL:chipi"
  WriteRegStr HKCR "chipi" "URL Protocol" ""
  WriteRegStr HKCR "chipi\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "chipi\shell" "" ""
  WriteRegStr HKCR "chipi\shell\Open" "" ""
  WriteRegStr HKCR "chipi\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend
