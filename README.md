# Google maps interface for ostis
Follow these steps to install:
- Download repo to /sc-web/components/googlemaps/
- Add this line to /ostis/client/templates/common.html:
```html
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR_GMAPS_API_KEY&libraries=places&sensor=false"></script>
```
- Add this line to /ostis/client/templates/components.html:
```html
<script type="text/javascript" charset="utf-8" src="/static/components/js/googlemaps/googlemaps.js"></script>
```
- Add a file with the following content to your knowledge base:
```scs
ui_external_languages
  -> google_maps_view;;

google_maps_view => nrel_main_idtf: [Отображение Google Maps] (*
  <- lang_ru;;
*);;

format_google_maps => nrel_main_idtf: [Формат Google Maps] (*
  <- lang_ru;;
*);;
```
- Run this code in /ostis/sc-web/scripts/
```bash
python build_components.py -i -a
```
- That's it!
