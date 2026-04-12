'use client'

import * as React from "react"
import { useTheme } from "@/context/theme"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Moon, Sun } from "lucide-react"

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { currentTheme, setTheme } = useTheme()
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Theme switcher">
        <Sun className="opacity-0" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Theme switcher">
          {currentTheme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={currentTheme === 'light' ? 'font-medium' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={currentTheme === 'dark' ? 'font-medium' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
