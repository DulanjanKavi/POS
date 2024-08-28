from pystray import Icon, MenuItem, Menu
from PIL import Image

# Create the icon


def start_system_tray_icon():

    iconPath = __file__.replace("Sync Tool\\systemTray.py", "public\icon.ico")

    icon = Icon(
        name="Sync Tool",
        title="Sync Tool",
        icon=Image.open(iconPath),
    )

    menu = Menu(
        MenuItem(
            'Exit',
            lambda: icon.stop()
        )
    )

    icon.menu = menu
    icon.run()


if __name__ == "__main__":
    start_system_tray_icon()