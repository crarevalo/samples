<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output
  method="html"
  media-type="text/xhtml"
  version="1.0"
  doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
  doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"/>

  <xsl:template match="log">
    <xsl:for-each select="paragraph">
      <div class="paragraph"><xsl:value-of select="."/></div>
    </xsl:for-each>
    <xsl:for-each select="line">
      <div class="line"><xsl:value-of select="."/></div>
    </xsl:for-each>
    <xsl:for-each select="message">
      <div class="message"><span class="message-id"><xsl:value-of select="@id"/></span><span class="timestamp"> (<xsl:value-of select="@timestamp"/>) </span><span><xsl:value-of select="."/></span></div>
    </xsl:for-each>
    <xsl:for-each select="item">
      <div class="message"><span class="timestamp"> (<xsl:value-of select="@timestamp"/>) </span><span><xsl:value-of select="."/></span></div>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>
