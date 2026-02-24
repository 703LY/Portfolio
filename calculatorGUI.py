import tkinter as tk
from tkinter import *


def discountfunc():
    try:
        # print("you clicked the discount button")
        price = float(entry_og.get())
        # print(f"price is {price}")
        discount = float(entry_discount.get())

        final_price = price * (1 - discount/100)
        
        label_final.config(text=f"Final Price: Rp. {final_price:.2f}")
    except ValueError:
        label_final.config(text="Invalid input")


# instantiate the window
window = Tk()
window.geometry("400x450")
window.title("703LY's Discount Calculator")

# og price label
label_og = Label(window, text = "Original Price: ")
label_og.pack()

# og price entry
entry_og = Entry(window, width = 25)
entry_og.pack()

# discount rate label
label_disc = Label(window, text = "Discount(%):" )
label_disc.pack()

# discount rate entry
entry_discount = Entry(window, width = 25)
entry_discount.pack(pady=(0,10))

# final price (discounted price) label
label_final = Label(window, text= f"Final Price: Rp. 0")
label_final.pack(pady=(10,0))

# customizables
icon = PhotoImage(file="wizard.png")
window.iconphoto(True, icon)

# buttons (for users to click to run functions)
button = Button(window, text="Calculate")
button.config(command=discountfunc)
button.config(activebackground='#4169E1')
button.pack()

# actually run the app
window.mainloop() 