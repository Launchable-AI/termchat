import React from 'react'
import { Text } from 'ink'

interface FilledLineProps {
  width: number
  children?: React.ReactNode
  backgroundColor?: string
  color?: string
  bold?: boolean
  paddingLeft?: number
}

/**
 * A text line that fills to a specified width with background color.
 * This is needed because Ink only supports backgroundColor on Text elements.
 */
export function FilledLine({
  width,
  children,
  backgroundColor,
  color,
  bold,
  paddingLeft = 0,
}: FilledLineProps) {
  // Convert children to string to calculate length
  const content = children?.toString() || ''
  const padding = ' '.repeat(paddingLeft)
  const contentWithPadding = padding + content
  const remainingSpace = Math.max(0, width - contentWithPadding.length)
  const filler = ' '.repeat(remainingSpace)
  
  return (
    <Text backgroundColor={backgroundColor} color={color} bold={bold}>
      {contentWithPadding}{filler}
    </Text>
  )
}

interface FilledTextProps {
  text: string
  width: number
  backgroundColor?: string
  color?: string
  bold?: boolean
}

/**
 * Renders text with a filled background to the specified width.
 */
export function FilledText({
  text,
  width,
  backgroundColor,
  color,
  bold,
}: FilledTextProps) {
  const remainingSpace = Math.max(0, width - text.length)
  const filler = ' '.repeat(remainingSpace)
  
  return (
    <Text backgroundColor={backgroundColor} color={color} bold={bold}>
      {text}{filler}
    </Text>
  )
}
